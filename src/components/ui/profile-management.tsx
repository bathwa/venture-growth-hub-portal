import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Camera, Upload, X, Edit, Save, User, Shield, FileText, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  company?: string;
  position?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  role: string;
  kyc_status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface ProfileManagementProps {
  userId: string;
  userRole: string;
  initialProfile?: ProfileData;
  onProfileUpdate?: (profile: ProfileData) => void;
}

export function ProfileManagement({ 
  userId, 
  userRole, 
  initialProfile,
  onProfileUpdate 
}: ProfileManagementProps) {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(initialProfile || {
    id: userId,
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    company: user?.company || '',
    position: user?.position || '',
    location: user?.location || '',
    website: user?.website || '',
    linkedin: user?.linkedin || '',
    twitter: user?.twitter || '',
    role: userRole,
    kyc_status: user?.kyc_status || 'not_submitted',
    created_at: user?.created_at || new Date().toISOString(),
    updated_at: user?.updated_at || new Date().toISOString()
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [kycDocuments, setKycDocuments] = useState<File[]>([]);
  const [showKycDialog, setShowKycDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const kycFileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const validateFile = (file: File, maxSize: number, allowedTypes: string[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 2 * 1024 * 1024, ['image/jpeg', 'image/png', 'image/jpg']);
      if (!validation.valid) {
        toast.error(validation.errors[0]);
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKycDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];

    files.forEach(file => {
      const validation = validateFile(file, 10 * 1024 * 1024, ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast.error(`${file.name}: ${validation.errors[0]}`);
      }
    });

    setKycDocuments(prev => [...prev, ...validFiles]);
  };

  const removeKycDocument = (index: number) => {
    setKycDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${avatarFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${userId}/avatar/${fileName}`;

      const { data, error } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar');
      return null;
    }
  };

  const uploadKycDocuments = async (): Promise<string[]> => {
    const uploadedPaths: string[] = [];

    for (const file of kycDocuments) {
      try {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `${userId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('kyc-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        uploadedPaths.push(filePath);
      } catch (error) {
        console.error('KYC document upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    return uploadedPaths;
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Upload avatar if changed
      let avatarUrl = profile.avatar;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      // Update profile in database
      const updatedProfileData = {
        name: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        company: profile.company,
        position: profile.position,
        location: profile.location,
        website: profile.website,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        avatar: avatarUrl,
        updated_at: new Date().toISOString()
      };

      await updateProfile(updatedProfileData);

      const updatedProfile: ProfileData = {
        ...profile,
        ...updatedProfileData
      };

      setProfile(updatedProfile);
      onProfileUpdate?.(updatedProfile);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview('');
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKycSubmit = async () => {
    if (kycDocuments.length === 0) {
      toast.error('Please upload at least one KYC document');
      return;
    }

    setIsLoading(true);

    try {
      const uploadedPaths = await uploadKycDocuments();
      
      if (uploadedPaths.length > 0) {
        // Update KYC status in database
        await updateProfile({
          kyc_status: 'pending',
          updated_at: new Date().toISOString()
        });

        // Update local state
        const updatedProfile: ProfileData = {
          ...profile,
          kyc_status: 'pending',
          updated_at: new Date().toISOString()
        };

        setProfile(updatedProfile);
        onProfileUpdate?.(updatedProfile);
        setShowKycDialog(false);
        setKycDocuments([]);
        toast.success('KYC documents submitted successfully');
      }
    } catch (error) {
      console.error('KYC submission error:', error);
      toast.error('Failed to submit KYC documents');
    } finally {
      setIsLoading(false);
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      default: return 'Not Submitted';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Profile Management</h2>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            KYC Verification
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Professional
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || profile.avatar} />
                    <AvatarFallback className="text-lg">
                      {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{profile.name}</h3>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                  <Badge className="mt-2">{profile.role}</Badge>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              <Separator />

              {/* Personal Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={true} // Email should not be editable
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification</CardTitle>
              <CardDescription>
                Complete your Know Your Customer verification to access all features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Verification Status</h3>
                  <Badge className={getKycStatusColor(profile.kyc_status)}>
                    {getKycStatusText(profile.kyc_status)}
                  </Badge>
                </div>
                <Dialog open={showKycDialog} onOpenChange={setShowKycDialog}>
                  <DialogTrigger asChild>
                    <Button disabled={profile.kyc_status === 'verified'}>
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Documents
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Submit KYC Documents</DialogTitle>
                      <DialogDescription>
                        Upload required documents for identity verification
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Upload Documents</Label>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            onClick={() => kycFileInputRef.current?.click()}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Files
                          </Button>
                          <input
                            ref={kycFileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleKycDocumentUpload}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {kycDocuments.length > 0 && (
                        <div className="space-y-2">
                          <Label>Selected Documents</Label>
                          <div className="space-y-2">
                            {kycDocuments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">{file.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeKycDocument(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowKycDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleKycSubmit} disabled={isLoading || kycDocuments.length === 0}>
                          {isLoading ? 'Submitting...' : 'Submit Documents'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Required Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium">Identity Document</h5>
                    <p className="text-sm text-gray-600">Passport, driver's license, or national ID</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium">Proof of Address</h5>
                    <p className="text-sm text-gray-600">Utility bill or bank statement (last 3 months)</p>
                  </div>
                  {userRole === 'entrepreneur' && (
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium">Business Registration</h5>
                      <p className="text-sm text-gray-600">Company registration certificate</p>
                    </div>
                  )}
                  {userRole === 'investor' && (
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium">Financial Statement</h5>
                      <p className="text-sm text-gray-600">Bank statement or investment portfolio</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>
                Update your professional details and social links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={profile.position || ''}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={profile.linkedin || ''}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    type="url"
                    value={profile.twitter || ''}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 