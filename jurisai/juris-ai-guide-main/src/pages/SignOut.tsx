"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import axios from '../axios';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/reducer';

interface Store {
  email: string;
  isLogin: boolean;
}

const SignOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const email = useSelector((state: Store) => state.email);

  const handleSignOut = async () => {
    try {
      const response = await axios.get("/signOut");
      const data = response.data;
      
      if (data.success) {
        dispatch(logout());
        toast({
          title: "Success",
          description: data.message,
          variant: "default",
        });
        setTimeout(() => navigate("/"), 1000);
      } else {
        toast({
          title: "Error",
          description: data.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "An error occurred while signing out",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Header />
      <div className='w-full h-full flex flex-col justify- items-center p-4'>
        <Card className="w-[400px] shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <UserCircle className="h-20 w-20 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Account</CardTitle>
            <CardDescription className="text-center">
              You are currently signed in as:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-lg font-medium text-muted-foreground">
              {email}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700" 
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default SignOut;