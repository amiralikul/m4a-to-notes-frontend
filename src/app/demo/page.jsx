'use client';

import FileUpload from '@/components/file-upload';
import { ProFeature, ProOnly, BusinessOnly } from '@/components/pro-feature';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEntitlements } from '@/hooks/use-entitlements';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Zap, Crown, Sparkles, ArrowLeft } from 'lucide-react';
import Link from "next/link";

export default function DemoPage() {
  const { entitlements, loading } = useEntitlements();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              M4A to Notes Demo
            </h1>
            {!loading && entitlements && (
              <Badge className={
                entitlements.plan === 'free' 
                  ? 'bg-gray-100 text-gray-800' 
                  : entitlements.plan === 'pro'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }>
                {entitlements.plan === 'free' && <Clock className="w-3 h-3 mr-1" />}
                {entitlements.plan === 'pro' && <Crown className="w-3 h-3 mr-1" />}
                {entitlements.plan === 'business' && <Sparkles className="w-3 h-3 mr-1" />}
                {entitlements.plan.charAt(0).toUpperCase() + entitlements.plan.slice(1)} Plan
              </Badge>
            )}
          </div>
          <p className="text-xl text-gray-600">
            Upload your M4A audio files and get instant transcriptions
          </p>
        </div>

        {/* Basic File Upload - Available to everyone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Transcription
            </CardTitle>
            <CardDescription>
              Upload and transcribe M4A files with basic features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>

        {/* Pro Features */}
        <ProOnly>
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Crown className="w-5 h-5" />
                Pro Transcription
              </CardTitle>
              <CardDescription>
                High accuracy transcription with advanced features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Priority Processing</h4>
                  <p className="text-sm text-gray-600">Faster transcription times</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Speaker ID</h4>
                  <p className="text-sm text-gray-600">Identify different speakers</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Timestamps</h4>
                  <p className="text-sm text-gray-600">Detailed time markers</p>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start Pro Transcription
              </Button>
            </CardContent>
          </Card>
        </ProOnly>

        {/* Business Features */}
        <BusinessOnly>
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Sparkles className="w-5 h-5" />
                Business Transcription
              </CardTitle>
              <CardDescription>
                Enterprise-grade transcription with custom vocabulary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Custom Vocabulary Training</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Train the AI with your industry-specific terms for improved accuracy
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add custom terms..." 
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <Button size="sm">Add</Button>
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Start Business Transcription
              </Button>
            </CardContent>
          </Card>
        </BusinessOnly>

        {/* Feature Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
            <CardDescription>See what's included with each plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Feature</th>
                    <th className="text-center py-2">Free</th>
                    <th className="text-center py-2">Pro</th>
                    <th className="text-center py-2">Business</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b">
                    <td className="py-2">Monthly transcription</td>
                    <td className="text-center">30 minutes</td>
                    <td className="text-center">10 hours</td>
                    <td className="text-center">50 hours</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Processing speed</td>
                    <td className="text-center">Standard</td>
                    <td className="text-center">Priority</td>
                    <td className="text-center">Fastest</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Export formats</td>
                    <td className="text-center">TXT</td>
                    <td className="text-center">TXT, DOCX, PDF</td>
                    <td className="text-center">All formats</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Speaker identification</td>
                    <td className="text-center">-</td>
                    <td className="text-center">✓</td>
                    <td className="text-center">Advanced</td>
                  </tr>
                  <tr>
                    <td className="py-2">Custom vocabulary</td>
                    <td className="text-center">-</td>
                    <td className="text-center">-</td>
                    <td className="text-center">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}