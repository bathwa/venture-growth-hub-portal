
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicHeader } from '@/components/common/PublicHeader';

const ForgotPassword = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password reset requested for:', emailOrPhone);
    setIsSubmitted(true);
    // TODO: Implement password reset logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PublicHeader />
      
      <div className="max-w-md mx-auto px-4 py-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>
              {isSubmitted 
                ? "We've sent reset instructions to your email/phone"
                : "Enter your email or phone number to reset your password"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailOrPhone">Email Address or Phone Number</Label>
                  <Input
                    id="emailOrPhone"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Enter your email or phone"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Reset Password
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-green-600">Reset instructions sent!</p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}

            <div className="mt-6 text-center space-y-2">
              <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500 block">
                Back to Login
              </Link>
              <Link to="/signup" className="text-sm text-blue-600 hover:text-blue-500 block">
                Don't have an account? Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
