import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Send, 
  Inbox,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Copy,
  CheckCircle,
  QrCode,
  Users
} from 'lucide-react';
import { localDb } from '../utils/localDb';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface TokenTransferProps {
  userBalance: number;
  userId: string;
  onTransferComplete: () => void;
}

export function TokenTransfer({ userBalance, userId, onTransferComplete }: TokenTransferProps) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [processing, setProcessing] = useState(false);
  const [transferHistory, setTransferHistory] = useState<any[]>([]);
  const [receivedHistory, setReceivedHistory] = useState<any[]>([]);

  useEffect(() => {
    loadTransferHistory();
  }, []);

  const loadTransferHistory = () => {
    const sent = localDb.getTokenTransfers('sent', userId);
    const received = localDb.getTokenTransfers('received', userId);
    setTransferHistory(sent.slice(-10).reverse()); // Show latest 10 sent transfers for this user
    setReceivedHistory(received.slice(-10).reverse()); // Show latest 10 received transfers for this user
  };

  const generateReceiveAddress = () => {
    // In production, this would be the user's actual Solana wallet address
    return userId.slice(0, 8) + '...' + userId.slice(-4);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(userId);
    toast.success('Address copied to clipboard');
  };

  const validateAddress = (address: string): boolean => {
    // Simple validation - in production would validate Solana address format
    return address.length >= 8;
  };

  const handleSendTokens = async () => {
    if (!recipientAddress || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const sendAmount = parseFloat(amount);

    if (sendAmount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (sendAmount > userBalance) {
      toast.error(`Insufficient balance. You have ${userBalance} BUILD`);
      return;
    }

    if (!validateAddress(recipientAddress)) {
      toast.error('Invalid recipient address');
      return;
    }

    if (recipientAddress === userId) {
      toast.error('Cannot send tokens to yourself');
      return;
    }

    setProcessing(true);

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record transfer
      localDb.createTokenTransfer({
        from: userId,
        to: recipientAddress,
        amount: sendAmount,
        memo: memo || 'Token transfer',
        type: 'sent',
      });

      // Create transaction record
      localDb.createTransaction(userId, {
        type: 'transferred',
        amount: -sendAmount,
        description: `Sent to ${recipientAddress.slice(0, 8)}...${recipientAddress.slice(-4)}${memo ? `: ${memo}` : ''}`,
      });

      toast.success('Transfer successful!', {
        description: `Sent ${sendAmount} BUILD to ${recipientAddress.slice(0, 8)}...${recipientAddress.slice(-4)}`,
      });

      setRecipientAddress('');
      setAmount('');
      setMemo('');
      loadTransferHistory();
      onTransferComplete();
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Transfer failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Tabs defaultValue="send" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="send">
          <Send className="h-4 w-4 mr-2" />
          Send
        </TabsTrigger>
        <TabsTrigger value="receive">
          <Inbox className="h-4 w-4 mr-2" />
          Receive
        </TabsTrigger>
        <TabsTrigger value="history">
          <ArrowUpRight className="h-4 w-4 mr-2" />
          History
        </TabsTrigger>
      </TabsList>

      {/* Send Tokens */}
      <TabsContent value="send">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-600" />
              Send BUILD Tokens
            </CardTitle>
            <CardDescription>
              Transfer BUILD tokens to other users on the network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recipient Address */}
            <div className="space-y-2">
              <Label>Recipient Address *</Label>
              <Input
                placeholder="Enter recipient's wallet address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Enter the wallet address of the person you want to send tokens to
              </p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount (BUILD) *</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={0}
                  step={0.01}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => setAmount(userBalance.toString())}
                  disabled={userBalance === 0}
                >
                  Max
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Available balance: {userBalance} BUILD
              </p>
            </div>

            {/* Memo (Optional) */}
            <div className="space-y-2">
              <Label>Memo (Optional)</Label>
              <Input
                placeholder="Add a note for this transfer"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-gray-500">
                Add a message or note for the recipient
              </p>
            </div>

            {/* Transfer Preview */}
            {amount && parseFloat(amount) > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <h4 className="font-medium text-blue-900">Transfer Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{parseFloat(amount)} BUILD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network Fee:</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                    <span className="text-blue-700 font-medium">You will send:</span>
                    <span className="font-bold text-lg text-blue-900">{parseFloat(amount)} BUILD</span>
                  </div>
                </div>
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSendTokens}
              disabled={processing || !recipientAddress || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > userBalance}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send {amount || '0'} BUILD
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Receive Tokens */}
      <TabsContent value="receive">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-emerald-600" />
              Receive BUILD Tokens
            </CardTitle>
            <CardDescription>
              Share your address to receive BUILD tokens from others
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Receive Address */}
            <div className="text-center space-y-4">
              <div className="p-8 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-white rounded-lg shadow-md">
                    <QrCode className="h-24 w-24 text-emerald-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">Your Wallet Address</p>
                <div className="bg-white px-4 py-3 rounded-lg border border-emerald-300 font-mono text-sm break-all">
                  {userId}
                </div>
              </div>

              <Button
                onClick={handleCopyAddress}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Address
              </Button>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4" />
                How to Receive Tokens
              </h4>
              <ol className="text-sm text-gray-600 space-y-1 ml-6 list-decimal">
                <li>Share your wallet address with the sender</li>
                <li>They enter your address in the Send tab</li>
                <li>You'll receive tokens instantly in your wallet</li>
                <li>Check the History tab to view received tokens</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Transfer History */}
      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transfer History</CardTitle>
            <CardDescription>Your recent token transfers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sent Transfers */}
            {transferHistory.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Sent Transfers
                </h4>
                {transferHistory.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          To: {transfer.to.slice(0, 8)}...{transfer.to.slice(-4)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transfer.timestamp).toLocaleString()}
                        </div>
                        {transfer.memo && (
                          <div className="text-xs text-gray-600 italic mt-1">"{transfer.memo}"</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm text-red-600">-{transfer.amount} BUILD</div>
                      <Badge variant="outline" className="text-xs">Sent</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Received Transfers */}
            {receivedHistory.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4" />
                  Received Transfers
                </h4>
                {receivedHistory.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          From: {transfer.from.slice(0, 8)}...{transfer.from.slice(-4)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transfer.timestamp).toLocaleString()}
                        </div>
                        {transfer.memo && (
                          <div className="text-xs text-gray-600 italic mt-1">"{transfer.memo}"</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm text-green-600">+{transfer.amount} BUILD</div>
                      <Badge variant="outline" className="text-xs">Received</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {transferHistory.length === 0 && receivedHistory.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No transfer history yet</p>
                <p className="text-sm">Send or receive tokens to see your history here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
