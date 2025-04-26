
import React, { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Clock, Award } from "lucide-react";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageWrapper
      isLoading={isLoading}
      loadingMessage="Loading your profile..."
      className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
    >
      <header className="flex items-center justify-between py-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-whoop-white mb-2 tracking-whoop">
            PROFILE
          </h1>
          <p className="text-xl text-whoop-white/70">
            Manage your personal information and preferences
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-whoop-black/80 backdrop-blur-sm border border-whoop-white/10">
          <CardHeader className="border-b border-whoop-white/10">
            <CardTitle className="text-whoop-white tracking-whoop">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <User className="h-5 w-5 text-whoop-teal" />
                <div>
                  <p className="text-sm text-whoop-white/50">Name</p>
                  <p className="font-medium text-whoop-white">John Doe</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Mail className="h-5 w-5 text-whoop-teal" />
                <div>
                  <p className="text-sm text-whoop-white/50">Email</p>
                  <p className="font-medium text-whoop-white">john@example.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="h-5 w-5 text-whoop-teal" />
                <div>
                  <p className="text-sm text-whoop-white/50">Member Since</p>
                  <p className="font-medium text-whoop-white">January 2024</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-whoop-black/80 backdrop-blur-sm border border-whoop-white/10">
          <CardHeader className="border-b border-whoop-white/10">
            <CardTitle className="text-whoop-white tracking-whoop">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Award className="h-5 w-5 text-whoop-teal" />
                <div>
                  <p className="text-sm text-whoop-white/50">Achievement Score</p>
                  <p className="font-medium text-whoop-white">850 points</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default Profile;
