import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Lock, 
  Briefcase, 
  Building, 
  MapPin, 
  Phone, 
  Globe, 
  Award, 
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axios';

const SignUp = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'user' | 'lawyer'>('user');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [lawyerData, setLawyerData] = useState({
    barNumber: '',
    barAssociation: '',
    practiceAreas: [''],
    yearsOfExperience: '',
    lawSchool: '',
    graduationYear: '',
    phone: '',
    officeAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    website: '',
    specializations: [''],
    languages: [''],
    bio: '',
    achievements: ['']
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLawyerDataChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setLawyerData(prev => {
        // Handle nested objects specifically
        if (parent === 'officeAddress') {
          return {
            ...prev,
            officeAddress: { ...prev.officeAddress, [child]: value }
          };
        }
        // For other nested objects, use type assertion
        const parentValue = prev[parent as keyof typeof prev] as Record<string, any>;
        return {
          ...prev,
          [parent]: { ...parentValue, [child]: value }
        };
      });
    } else {
      setLawyerData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayFieldChange = (field: string, index: number, value: string) => {
    setLawyerData(prev => {
      const newArray = [...(prev[field as keyof typeof prev] as string[])];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayField = (field: string) => {
    setLawyerData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), '']
    }));
  };

  const removeArrayField = (field: string, index: number) => {
    setLawyerData(prev => {
      const newArray = [...(prev[field as keyof typeof prev] as string[])];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (userType === 'lawyer') {
      // Validate required lawyer fields
      const requiredFields = ['barNumber', 'barAssociation', 'practiceAreas', 'yearsOfExperience', 'lawSchool', 'graduationYear', 'phone', 'bio'];
      for (const field of requiredFields) {
        if (field === 'practiceAreas') {
          if (!lawyerData.practiceAreas[0] || lawyerData.practiceAreas[0].trim() === '') {
            toast({
              title: "Error",
              description: "At least one practice area is required",
              variant: "destructive",
            });
            return;
          }
        } else if (!lawyerData[field as keyof typeof lawyerData]) {
          toast({
            title: "Error",
            description: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
            variant: "destructive",
          });
          return;
        }
      }
      
      // Validate country field specifically
      if (!lawyerData.officeAddress.country) {
        toast({
          title: "Error",
          description: "Country is required in office address",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const signupData = {
        ...formData,
        userType,
        ...(userType === 'lawyer' && { lawyerData })
      };

      const response = await axios.post('/signUp', signupData);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          variant: "default",
        });
        
        // Redirect to sign in page
        navigate('/signIn');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Create Your Account</CardTitle>
          <CardDescription>
            Join our legal community and get started with your legal journey
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div className="text-center">
              <Label className="text-lg font-medium mb-4 block">I want to register as:</Label>
              <div className="flex gap-4 justify-center">
                <Button
                  type="button"
                  variant={userType === 'user' ? 'default' : 'outline'}
                  onClick={() => setUserType('user')}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Legal Client
                </Button>
                <Button
                  type="button"
                  variant={userType === 'lawyer' ? 'default' : 'outline'}
                  onClick={() => setUserType('lawyer')}
                  className="flex items-center gap-2"
                >
                  <Briefcase className="h-4 w-4" />
                  Lawyer
                </Button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Lawyer-Specific Fields */}
            {userType === 'lawyer' && (
              <div className="space-y-6 border-t pt-6">
                <div className="text-center">
                  <Badge variant="outline" className="flex items-center gap-2 mx-auto w-fit">
                    <Briefcase className="h-4 w-4" />
                    Lawyer Registration
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please provide your professional information for verification
                  </p>
                </div>

                {/* Professional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="barNumber">Bar Number *</Label>
                    <Input
                      id="barNumber"
                      placeholder="Enter bar number"
                      value={lawyerData.barNumber}
                      onChange={(e) => handleLawyerDataChange('barNumber', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="barAssociation">Bar Association *</Label>
                    <Input
                      id="barAssociation"
                      placeholder="Enter bar association"
                      value={lawyerData.barAssociation}
                      onChange={(e) => handleLawyerDataChange('barAssociation', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lawSchool">Law School *</Label>
                    <Input
                      id="lawSchool"
                      placeholder="Enter law school"
                      value={lawyerData.lawSchool}
                      onChange={(e) => handleLawyerDataChange('lawSchool', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year *</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      placeholder="Enter graduation year"
                      value={lawyerData.graduationYear}
                      onChange={(e) => handleLawyerDataChange('graduationYear', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      placeholder="Enter years of experience"
                      value={lawyerData.yearsOfExperience}
                      onChange={(e) => handleLawyerDataChange('yearsOfExperience', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={lawyerData.phone}
                        onChange={(e) => handleLawyerDataChange('phone', e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Practice Areas */}
                <div className="space-y-2">
                  <Label>Practice Areas *</Label>
                  <div className="space-y-2">
                    {lawyerData.practiceAreas.map((area, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Enter practice area"
                          value={area}
                          onChange={(e) => handleArrayFieldChange('practiceAreas', index, e.target.value)}
                          required={index === 0}
                        />
                        {lawyerData.practiceAreas.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayField('practiceAreas', index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayField('practiceAreas')}
                    >
                      Add Practice Area
                    </Button>
                  </div>
                </div>

                {/* Office Address */}
                <div className="space-y-2">
                  <Label>Office Address</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Street Address"
                      value={lawyerData.officeAddress.street}
                      onChange={(e) => handleLawyerDataChange('officeAddress.street', e.target.value)}
                    />
                    <Input
                      placeholder="City"
                      value={lawyerData.officeAddress.city}
                      onChange={(e) => handleLawyerDataChange('officeAddress.city', e.target.value)}
                    />
                    <Input
                      placeholder="State"
                      value={lawyerData.officeAddress.state}
                      onChange={(e) => handleLawyerDataChange('officeAddress.state', e.target.value)}
                    />
                    <Input
                      placeholder="ZIP Code"
                      value={lawyerData.officeAddress.zipCode}
                      onChange={(e) => handleLawyerDataChange('officeAddress.zipCode', e.target.value)}
                    />
                  </div>
                  {/* Add Country field */}
                  <div className="mt-4">
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={lawyerData.officeAddress.country}
                      onValueChange={(value) => handleLawyerDataChange('officeAddress.country', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="IT">Italy</SelectItem>
                        <SelectItem value="ES">Spain</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="CN">China</SelectItem>
                        <SelectItem value="BR">Brazil</SelectItem>
                        <SelectItem value="MX">Mexico</SelectItem>
                        <SelectItem value="NL">Netherlands</SelectItem>
                        <SelectItem value="SE">Sweden</SelectItem>
                        <SelectItem value="NO">Norway</SelectItem>
                        <SelectItem value="DK">Denmark</SelectItem>
                        <SelectItem value="FI">Finland</SelectItem>
                        <SelectItem value="CH">Switzerland</SelectItem>
                        <SelectItem value="AT">Austria</SelectItem>
                        <SelectItem value="BE">Belgium</SelectItem>
                        <SelectItem value="IE">Ireland</SelectItem>
                        <SelectItem value="NZ">New Zealand</SelectItem>
                        <SelectItem value="SG">Singapore</SelectItem>
                        <SelectItem value="HK">Hong Kong</SelectItem>
                        <SelectItem value="ZA">South Africa</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      placeholder="Enter website URL"
                      value={lawyerData.website}
                      onChange={(e) => handleLawyerDataChange('website', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Summary *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Describe your legal expertise, experience, and approach..."
                    value={lawyerData.bio}
                    onChange={(e) => handleLawyerDataChange('bio', e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 100 characters. This will be visible to potential clients.
                  </p>
                </div>

                {/* Verification Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Verification Required</p>
                      <p>
                        After registration, your application will be reviewed by our admin team. 
                        This process typically takes 2-3 business days. You'll receive an email 
                        notification once verified.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  {userType === 'lawyer' ? (
                    <>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Submit Lawyer Application
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Create Account
                    </>
                  )}
                </>
              )}
            </Button>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/signIn" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;