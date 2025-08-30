/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useRef } from 'react';
import { Users, Plus, Trash2, Sparkles, Receipt, Upload, X, Camera } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MyInput } from '../components/ui/MyInput';
import { Chip } from '../components/ui/Chip';
import { SplitParticipant } from '../types';
import { useAI } from '../hooks/useAI';
import { usePay } from '../hooks/usePay';

export const SplitBill = () => {
  const [receiptText, setReceiptText] = useState('');
  const handleParticipantChange = (id: string, field: keyof SplitParticipant, value: string) => {
    try {
      setParticipants(prev => 
        prev.map(participant =>
          participant.id === id ? { ...participant, [field]: value } : participant
        )
      );
    } catch (error) {
      console.error('Error updating participant:', error);
      toast.error('Failed to update participant. Please try again.');
    }
  };

  const [participants, setParticipants] = useState<SplitParticipant[]>([
    { id: '1', name: 'You', share: 1, owedAmount: '0' },
    { id: '2', name: '', share: 1, owedAmount: '0' }
  ]);
  const [totalAmount, setTotalAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { parseReceipt, isTyping: isAIParsing, setIsTyping } = useAI();
  const { preparePayment, submitPayment, isProcessing: isPaymentProcessing } = usePay();
  const [paymentStatus, setPaymentStatus] = useState<Record<string, 'idle' | 'processing' | 'success' | 'error'>>({});
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  const [isCreatingPayments, setIsCreatingPayments] = useState(false);

  const createPaymentRequest = async (participant: SplitParticipant) => {
    if (!participant.owedAmount || parseFloat(participant.owedAmount) <= 0) {
      const errorMsg = `Invalid amount for ${participant.name || 'participant'}`;
      console.error(errorMsg);
      toast.error('Invalid Amount', {
        description: 'Please enter a valid amount greater than 0',
        duration: 5000,
      });
      setPaymentErrors(prev => ({
        ...prev,
        [participant.id]: errorMsg
      }));
      return;
    }

    // Check for valid wallet address
    if (!participant.walletAddress || participant.walletAddress.trim() === '') {
      const errorMsg = `Missing wallet address for ${participant.name || 'participant'}`;
      console.error(errorMsg);
      toast.error('Missing Wallet', {
        description: 'Please enter a valid wallet address',
        duration: 5000,
      });
      setPaymentErrors(prev => ({
        ...prev,
        [participant.id]: 'Missing wallet address'
      }));
      return;
    }

    setPaymentStatus(prev => ({
      ...prev,
      [participant.id]: 'processing'
    }));

    try {
      // Prepare payment data
      const paymentData = {
        to: participant.walletAddress,
        amount: participant.owedAmount,
        memo: `Payment for ${participant.name || 'a participant'}'s share of the bill`,
      };

      console.log('Preparing payment:', paymentData);
      
      // Validate and prepare payment
      if (preparePayment(paymentData)) {
        console.log('Payment prepared, submitting...');
        await submitPayment();
        
        toast.success('Payment Successful', {
          description: `Successfully processed payment for ${participant.name || 'participant'}`,
          duration: 5000,
        });
        
        setPaymentStatus(prev => ({
          ...prev,
          [participant.id]: 'success'
        }));
        
        // Clear success status after 3 seconds
        setTimeout(() => {
          setPaymentStatus(prev => ({
            ...prev,
            [participant.id]: 'idle'
          }));
        }, 3000);
      } else {
        throw new Error('Failed to prepare payment');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment request';
      console.error('Payment request failed:', error);
      
      toast.error('Payment Failed', {
        description: errorMessage,
        duration: 5000,
      });
      
      setPaymentErrors(prev => ({
        ...prev,
        [participant.id]: errorMessage
      }));
      
      setPaymentStatus(prev => ({
        ...prev,
        [participant.id]: 'error'
      }));
    }
  };

  // Start camera when showCamera is true
  useEffect(() => {
    if (showCamera && videoRef.current) {
      const constraints = {
        video: { facingMode: 'environment' }, // Use back camera by default
        audio: false
      };

      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraStream(stream);
          }
        })
        .catch((err) => {
          console.error('Error accessing camera:', err);
          setErrors(prev => ({ ...prev, receipt: 'Could not access camera. Please check permissions.' }));
          setShowCamera(false);
        });
    }

    // Cleanup function to stop the camera when component unmounts or showCamera becomes false
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    };
  }, [showCamera]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setShowCamera(false);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const addParticipant = () => {
    const newParticipant: SplitParticipant = {
      id: Date.now().toString(),
      name: '',
      walletAddress: '',
      share: 1,
      owedAmount: '0'
    };
    setParticipants([...participants, newParticipant]);
  };

  const removeParticipant = (id: string) => {
    try {
      const participant = participants.find(p => p.id === id);
      if (participant) {
        setParticipants(participants.filter(p => p.id !== id));
        toast.success(`Removed ${participant.name || 'participant'} from the split`);
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Failed to remove participant. Please try again.');
    }
  };

  const updateParticipant = (id: string, field: keyof SplitParticipant, value: string | number) => {
    try {
      setParticipants(participants.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      ));
      calculateSplit();
    } catch (error) {
      console.error('Error updating participant:', error);
      toast.error('Failed to update participant. Please try again.');
    }
  };

  const calculateSplit = () => {
    if (!totalAmount) return;
    
    const total = parseFloat(totalAmount);
    const totalShares = participants.reduce((sum, p) => sum + p.share, 0);
    
    setParticipants(participants.map(p => ({
      ...p,
      owedAmount: ((p.share / totalShares) * total).toFixed(2)
    })));
  };

  const handleAIParse = async () => {
    if (!receiptText.trim() && !selectedImage) {
      setErrors(prev => ({ ...prev, receipt: 'Please upload a receipt image or paste the receipt text' }));
      return;
    }

    try {
      setIsTyping(true);
      setErrors(prev => ({ ...prev, receipt: '' }));
      
      // Get participant names, excluding empty ones
      const participantNames = participants
        .map(p => p.name.trim())
        .filter(name => name && name.toLowerCase() !== 'you');
      
      if (participantNames.length === 0) {
        throw new Error('Please add at least one participant with a name');
      }

      let result;
      
      if (selectedImage) {
        // Handle image upload
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('participants', JSON.stringify(['You', ...participantNames]));
        
        // Call the API to process the image
        const response = await fetch('/api/parse-receipt-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to process receipt image');
        }
        
        result = await response.json();
      } else {
        // Fall back to text parsing if no image is selected
        result = await parseReceipt(receiptText, ['You', ...participantNames]);
      }
      
      // Update the total amount
      if (result.totalAmount) {
        setTotalAmount(parseFloat(result.totalAmount).toFixed(2));
      }
      
      // Update participants with their shares
      if (result.participants) {
        const updatedParticipants = participants.map(p => {
          const aiData = result.participants.find(
            (ap: any) => ap.name.toLowerCase() === p.name.toLowerCase() || 
                        (p.name === 'You' && ap.name.toLowerCase() === 'you')
          );
          
          if (aiData) {
            return {
              ...p,
              share: aiData.share || 1,
              owedAmount: '0' // Will be calculated by calculateSplit
            };
          }
          return p;
        });
        
        setParticipants(updatedParticipants);
        
        // Recalculate the split with the new shares
        calculateSplit();
      }
      
    } catch (error) {
      console.error('Error parsing receipt:', error);
      setErrors(prev => ({ 
        ...prev, 
        receipt: error instanceof Error ? error.message : 'Failed to parse receipt' 
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const createPaymentRequests = async () => {
    console.log('Create Payment Requests button clicked');
    console.log('Current participants:', participants);
    
    try {
      setIsCreatingPayments(true);
      setErrors(prev => ({ ...prev, payment: '' }));
      
      // Filter out participants with invalid wallet addresses or zero amounts
      const validParticipants = participants.filter(p => {
        const hasValidAddress = p.walletAddress && p.walletAddress.trim() !== '';
        const hasValidAmount = parseFloat(p.owedAmount) > 0;
        console.log(`Participant ${p.name}: hasValidAddress=${hasValidAddress}, hasValidAmount=${hasValidAmount}`);
        return hasValidAddress && hasValidAmount;
      });

      console.log('Valid participants:', validParticipants);

      if (validParticipants.length === 0) {
        const errorMsg = 'No valid participants with wallet addresses and positive amounts';
        console.error(errorMsg);
        toast.error('Payment Error', {
          description: 'Please add wallet addresses and ensure amounts are greater than 0',
          duration: 5000,
        });
        setErrors(prev => ({
          ...prev,
          payment: errorMsg
        }));
        return;
      }

      // Process each participant's payment
      for (const participant of validParticipants) {
        console.log('Processing payment for participant:', participant);
        try {
          setPaymentStatus(prev => ({
            ...prev,
            [participant.id]: 'processing'
          }));
          
          // Prepare payment data
          const paymentData = {
            to: participant.walletAddress,
            amount: participant.owedAmount,
            memo: `Payment for ${participant.name}'s share of the bill`,
          };

          console.log('Preparing payment:', paymentData);
          
          // Validate and prepare payment
          if (preparePayment(paymentData)) {
            console.log('Payment prepared, submitting...');
            
            // Submit payment
            await submitPayment();
            
            // Show success toast
            toast.success('Payment Request Sent', {
              description: `Payment request for ${participant.owedAmount} SHM to ${participant.name} has been created.`,
              duration: 5000,
            });
            
            // Update UI to show success
            setPaymentStatus(prev => ({
              ...prev,
              [participant.id]: 'success'
            }));
            
            // Clear success status after 3 seconds
            setTimeout(() => {
              setPaymentStatus(prev => ({
                ...prev,
                [participant.id]: 'idle'
              }));
            }, 3000);
          } else {
            throw new Error('Failed to prepare payment');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create payment request';
          console.error(`Payment failed for ${participant.name}:`, error);
          
          toast.error('Payment Failed', {
            description: `Failed to create payment for ${participant.name}: ${errorMessage}`,
            duration: 5000,
          });
          
          setPaymentErrors(prev => ({
            ...prev,
            [participant.id]: errorMessage
          }));
          
          setPaymentStatus(prev => ({
            ...prev,
            [participant.id]: 'error'
          }));
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error in createPaymentRequests:', error);
      
      toast.error('Payment Error', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsCreatingPayments(false);
    }
  };

  return (
    <>
      <Toaster 
        position="top-center" 
        richColors 
        closeButton 
        visibleToasts={5}
        toastOptions={{
          duration: 5000,
          style: {
            zIndex: 10000,
            fontSize: '0.875rem',
            maxWidth: '100%',
            padding: '0.75rem 1rem',
          },
        }}
      />
      <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <Users className="mr-3 h-8 w-8 text-primary" />
            Split Bill
          </h1>
          <p className="text-muted-foreground">
            AI-powered bill splitting with receipt scanning
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Receipt Input */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="mr-2 h-5 w-5" />
                Receipt Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Receipt (or take a photo)
                  </label>
                  
                  {showCamera ? (
                    <div className="relative w-full bg-black rounded-lg overflow-hidden">
                      <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="bg-white rounded-full p-3 hover:bg-gray-100"
                          title="Take photo"
                        >
                          <div className="w-8 h-8 bg-red-500 rounded-full" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (cameraStream) {
                              cameraStream.getTracks().forEach(track => track.stop());
                              setCameraStream(null);
                            }
                            setShowCamera(false);
                          }}
                          className="bg-white rounded-full p-3 hover:bg-gray-100"
                          title="Cancel"
                        >
                          <X className="w-6 h-6 text-gray-800" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowCamera(true)}
                          className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg bg-input hover:bg-accent/50 transition-colors"
                        >
                          <Camera className="w-6 h-6 mb-1 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Take Photo</span>
                        </button>
                        <div className="relative flex-1">
                          <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg bg-input hover:bg-accent/50 transition-colors cursor-pointer">
                            <div className="flex flex-col items-center">
                              <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Upload</span>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSelectedImage(file);
                                  setImagePreview(URL.createObjectURL(file));
                                  setReceiptText(''); // Clear text input when image is selected
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        {selectedImage ? selectedImage.name : 'PNG, JPG, or PDF (MAX. 5MB)'}
                      </p>
                    </div>
                  )}
                  {imagePreview && (
                    <div className="mt-2 relative">
                      <img 
                        src={imagePreview} 
                        alt="Receipt preview" 
                        className="h-32 object-contain border rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Or paste receipt text
                  </label>
                  <textarea
                    className="w-full h-32 rounded-xl border border-border bg-input px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    placeholder="Or copy and paste your receipt text here for AI parsing..."
                    value={receiptText}
                    onChange={(e) => {
                      setReceiptText(e.target.value);
                      if (e.target.value) {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }
                    }}
                  />
                </div>
              </div>
              
              <Button
                variant="hero"
                onClick={handleAIParse}
                disabled={!receiptText || isAIParsing}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isAIParsing ? 'AI Parsing Receipt...' : 'Let AI Parse Receipt'}
              </Button>

              <div className="text-center text-muted-foreground text-sm">
                <span>— or enter details manually —</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Amount (SHM)
                </label>
                <MyInput
                  type="number"
                  placeholder="0.00"
                  value={totalAmount}
                  onChange={(e) => {
                    setTotalAmount(e.target.value);
                    setTimeout(calculateSplit, 100);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Participants
                </span>
                <Button variant="outline" size="sm" onClick={addParticipant}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-3">
                  <div className="flex-1 space-y-1">
                    <MyInput
                      type="text"
                      placeholder="Name"
                      value={participant.name}
                      onChange={(e) => handleParticipantChange(participant.id, 'name', e.target.value)}
                      className="w-full"
                    />
                    <MyInput
                      type="text"
                      placeholder="Wallet Address (0x...)"
                      value={participant.walletAddress || ''}
                      onChange={(e) => handleParticipantChange(participant.id, 'walletAddress', e.target.value)}
                      className="w-full text-xs h-8"
                    />
                  </div>
                  <MyInput
                    type="number"
                    placeholder="1"
                    value={participant.share}
                    onChange={(e) => updateParticipant(participant.id, 'share', parseFloat(e.target.value) || 1)}
                    className="w-16"
                  />
                  <div className="w-20 text-sm font-medium text-center">
                    ₦{participant.owedAmount}
                  </div>
                  {participants.length > 1 && participant.name !== 'You' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeParticipant(participant.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        {totalAmount && (
          <Card variant="glow" className="mt-8 animate-fade-in">
            <CardHeader>
              <CardTitle>Split Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Bill</div>
                  <div className="text-2xl font-bold">{totalAmount} SHM</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Per Person (Equal Split)</div>
                  <div className="text-2xl font-bold">
                    {(parseFloat(totalAmount) / participants.length).toFixed(2)} SHM
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="text-sm font-medium mb-3">Individual Amounts:</div>
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-medium">
                        {participant.name || 'Unnamed'}
                      </span>
                      {participant.name === 'You' && (
                        <Chip variant="primary" size="sm" className="ml-2">You</Chip>
                      )}
                    </div>
                    <span className="font-semibold">{participant.owedAmount} SHM</span>
                  </div>
                ))}
              </div>

              <Button
                variant="glow"
                onClick={createPaymentRequests}
                disabled={!totalAmount || participants.some(p => !p.name) || isCreatingPayments}
                className="w-full mt-6"
              >
                {isCreatingPayments ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Payments...
                  </>
                ) : (
                  'Create Payment Requests'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* AI Features */}
        <Card variant="glass" className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI-Powered Features</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <span className="mr-2">📸</span>
                <span>Receipt text parsing</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🧮</span>
                <span>Automatic tax & tip calculation</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">👥</span>
                <span>Smart participant detection</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">💳</span>
                <span>One-click payment requests</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
};