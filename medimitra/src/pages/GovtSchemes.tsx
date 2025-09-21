import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckCircle, 
  XCircle,
  User,
  DollarSign,
  Calendar,
  Info,
  ExternalLink,
  Shield
} from 'lucide-react';

const GovtSchemes = () => {
  const { t } = useTranslation();
  const [userAge, setUserAge] = useState('');
  const [userIncome, setUserIncome] = useState('');

  const schemes = [
    {
      name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana',
      shortName: 'AB-PMJAY',
      description: 'Health insurance coverage up to ₹5 lakh per family per year',
      coverage: '₹5,00,000',
      eligibility: 'BPL families as per SECC-2011 census',
      benefits: [
        'Free treatment in empaneled hospitals',
        'Covers hospitalization expenses',
        'Pre and post hospitalization care',
        'Medicine and diagnostics coverage'
      ],
      documents: ['Aadhaar Card', 'Ration Card', 'SECC verification'],
      applicationProcess: 'Online at pmjay.gov.in or nearest CSC',
      status: 'active',
      eligible: null
    },
    {
      name: 'Punjab State Health Insurance Scheme',
      shortName: 'PSHIS',
      description: 'State health insurance for Punjab residents',
      coverage: '₹3,00,000',
      eligibility: 'All Punjab residents with annual income < ₹2 lakh',
      benefits: [
        'Cashless treatment in network hospitals',
        'OPD and IPD coverage',
        'Emergency services',
        'Diagnostic tests coverage'
      ],
      documents: ['Punjab Domicile Certificate', 'Income Certificate', 'Aadhaar Card'],
      applicationProcess: 'District Health Office or online portal',
      status: 'active',
      eligible: null
    },
    {
      name: 'Rashtriya Swasthya Bima Yojana (RSBY)',
      shortName: 'RSBY',
      description: 'Central government health insurance scheme',
      coverage: '₹30,000',
      eligibility: 'BPL families',
      benefits: [
        'Smart card based cashless treatment',
        'Pre-existing disease coverage',
        'Family floater policy',
        'Transportation allowance'
      ],
      documents: ['BPL Card', 'Aadhaar Card', 'Family details'],
      applicationProcess: 'Through designated enrollment agencies',
      status: 'merged',
      eligible: null
    },
    {
      name: 'Janani Suraksha Yojana (JSY)',
      shortName: 'JSY',
      description: 'Safe motherhood intervention for pregnant women',
      coverage: 'Cash assistance',
      eligibility: 'Pregnant women from BPL families',
      benefits: [
        'Cash assistance for institutional delivery',
        'Free delivery in government hospitals',
        'Antenatal care',
        'Postnatal care'
      ],
      documents: ['Pregnancy registration card', 'BPL Card', 'Aadhaar Card'],
      applicationProcess: 'Register at nearest ANM/ASHA worker',
      status: 'active',
      eligible: null
    }
  ];

  const checkEligibility = () => {
    // Simple eligibility check logic
    const age = parseInt(userAge);
    const income = parseInt(userIncome);
    
    schemes.forEach(scheme => {
      if (scheme.shortName === 'AB-PMJAY') {
        scheme.eligible = income < 200000;
      } else if (scheme.shortName === 'PSHIS') {
        scheme.eligible = income < 200000;
      } else if (scheme.shortName === 'RSBY') {
        scheme.eligible = income < 100000;
      } else if (scheme.shortName === 'JSY') {
        scheme.eligible = income < 200000; // Additional gender check needed in real scenario
      }
    });
  };

  const applicationSteps = [
    {
      step: 1,
      title: 'Check Eligibility',
      description: 'Verify if you meet the scheme criteria'
    },
    {
      step: 2,
      title: 'Gather Documents',
      description: 'Collect required documents and certificates'
    },
    {
      step: 3,
      title: 'Apply Online/Offline',
      description: 'Submit application through designated channels'
    },
    {
      step: 4,
      title: 'Verification',
      description: 'Wait for document and eligibility verification'
    },
    {
      step: 5,
      title: 'Receive Benefits',
      description: 'Start using your health insurance benefits'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl-rural font-bold text-foreground mb-4">
            🏛️ Government Health Schemes
          </h1>
          <p className="text-lg text-muted-foreground">
            Check your eligibility for government health insurance and schemes
          </p>
        </div>

        {/* Eligibility Checker */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              Quick Eligibility Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                placeholder="Your Age"
                type="number"
                value={userAge}
                onChange={(e) => setUserAge(e.target.value)}
              />
              <Input
                placeholder="Annual Income (₹)"
                type="number"
                value={userIncome}
                onChange={(e) => setUserIncome(e.target.value)}
              />
              <Button onClick={checkEligibility}>
                Check Eligibility
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download Forms
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Government Schemes */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Available Health Schemes</h2>
          <div className="space-y-6">
            {schemes.map((scheme, index) => (
              <Card key={index} className="service-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <h3 className="font-bold text-lg">{scheme.name}</h3>
                        <Badge 
                          variant={scheme.status === 'active' ? 'secondary' : 'outline'}
                          className={scheme.status === 'active' ? 'bg-success/10 text-success' : ''}
                        >
                          {scheme.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{scheme.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{scheme.coverage}</p>
                      <p className="text-sm text-muted-foreground">Coverage</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Eligibility Status */}
                  {scheme.eligible !== null && (
                    <div className="mb-4">
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        scheme.eligible 
                          ? 'bg-success/10 text-success border border-success/20' 
                          : 'bg-destructive/10 text-destructive border border-destructive/20'
                      }`}>
                        {scheme.eligible ? (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">You are eligible for this scheme!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">You may not be eligible for this scheme.</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2 text-primary">Eligibility Criteria</h4>
                      <p className="text-sm text-muted-foreground mb-4">{scheme.eligibility}</p>
                      
                      <h4 className="font-semibold mb-2 text-primary">Key Benefits</h4>
                      <ul className="space-y-1">
                        {scheme.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-primary">Required Documents</h4>
                      <ul className="space-y-1 mb-4">
                        {scheme.documents.map((doc, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <FileText className="h-4 w-4 text-accent mt-0.5" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>

                      <h4 className="font-semibold mb-2 text-primary">How to Apply</h4>
                      <p className="text-sm text-muted-foreground mb-4">{scheme.applicationProcess}</p>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          Apply Now
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          More Info
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📋 Application Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-5">
              {applicationSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto mb-2">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="service-card text-center cursor-pointer hover:bg-gradient-card">
            <CardContent className="p-6">
              <Info className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Scheme Details</h3>
              <p className="text-sm text-muted-foreground">Get detailed information</p>
            </CardContent>
          </Card>
          
          <Card className="service-card text-center cursor-pointer hover:bg-gradient-card">
            <CardContent className="p-6">
              <User className="h-8 w-8 mx-auto mb-3 text-secondary" />
              <h3 className="font-semibold mb-2">Application Help</h3>
              <p className="text-sm text-muted-foreground">Get assistance with applications</p>
            </CardContent>
          </Card>
          
          <Card className="service-card text-center cursor-pointer hover:bg-gradient-card">
            <CardContent className="p-6">
              <FileText className="h-8 w-8 mx-auto mb-3 text-accent" />
              <h3 className="font-semibold mb-2">Download Forms</h3>
              <p className="text-sm text-muted-foreground">Get application forms</p>
            </CardContent>
          </Card>

          <Card className="service-card text-center cursor-pointer hover:bg-gradient-card">
            <CardContent className="p-6">
              <CheckCircle className="h-8 w-8 mx-auto mb-3 text-success" />
              <h3 className="font-semibold mb-2">Track Status</h3>
              <p className="text-sm text-muted-foreground">Check application status</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GovtSchemes;