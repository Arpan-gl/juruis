import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Check, Star } from 'lucide-react'
import Header from '@/components/Header'

const plans = [
  {
    name: 'Free',
    price: '₹0',
    yearlyPrice: '₹0',
    features: ['Limited Chat', 'No history', 'Basic contract insights'],
    highlighted: false,
    cta: 'Get Started'
  },
  {
    name: 'Pro',
    price: '₹499/mo',
    yearlyPrice: '₹4999/yr',
    features: ['100 chats', 'History & memory', 'Clause explanation', 'Priority response'],
    highlighted: true,
    cta: 'Choose Pro',
    badge: 'Most Popular'
  },
  {
    name: 'Enterprise',
    price: '₹849/mo',
    yearlyPrice: '₹8499/yr',
    features: ['200 chats', 'Admin dashboard', 'Custom analysis', '24/7 support', 'Team collaboration'],
    highlighted: false,
    cta: 'Contact Sales'
  },
]

export default function MembershipPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [hoveredPlan, setHoveredPlan] = useState(null)

  return (
    <>
      <Header />
      
      <div className="container py-16 max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-5xl font-bold text-juris-primary">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of our AI legal assistant by upgrading to a premium plan tailored to your needs.
          </p>
          
          <div className="flex justify-center items-center gap-4 pt-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-juris-primary' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <div className="relative">
              <Switch 
                checked={isYearly} 
                onCheckedChange={setIsYearly} 
                className="data-[state=checked]:bg-juris-accent"
              />
              {isYearly && (
                <Badge className="absolute -top-6 -right-8 bg-green-500 text-xs">
                  Save 16%
                </Badge>
              )}
            </div>
            <span className={`text-sm font-medium ${isYearly ? 'text-juris-primary' : 'text-muted-foreground'}`}>
              Yearly
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className="relative"
              onMouseEnter={() => setHoveredPlan(plan.name)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 right-6 bg-juris-accent text-white px-3 py-1 rounded-full">
                  {plan.badge}
                </Badge>
              )}
              <Card
                className={`h-full rounded-2xl transition-all duration-300 ${
                  plan.highlighted 
                    ? 'border-2 border-juris-accent bg-juris-light/20 shadow-lg' 
                    : hoveredPlan === plan.name
                      ? 'shadow-lg border-juris-light' 
                      : 'bg-background shadow border-transparent'
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-2xl text-juris-primary">
                    {plan.highlighted && <Star className="h-5 w-5 mr-2 text-juris-accent fill-juris-accent" />}
                    {plan.name}
                  </CardTitle>
                  <div className="mt-2">
                    <p className="text-4xl font-bold">
                      {isYearly ? plan.yearlyPrice : plan.price}
                    </p>
                    {isYearly && plan.name !== 'Free' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed annually
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="py-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <div className={`rounded-full p-1 ${plan.highlighted ? 'bg-juris-accent/20' : 'bg-gray-100'}`}>
                          <Check className={`h-4 w-4 ${plan.highlighted ? 'text-juris-accent' : 'text-gray-600'}`} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-2">
                  <Button 
                    className={`w-full py-6 ${
                      plan.highlighted 
                        ? 'bg-juris-accent hover:bg-juris-accent/90' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                    variant={plan.highlighted ? 'default' : 'secondary'}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-24 max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-semibold text-juris-primary text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-lg">Can I cancel anytime?</h3>
              <p className="text-muted-foreground mt-2">Yes, you can cancel your subscription anytime from your account settings with no questions asked.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-lg">Is the Free plan really free?</h3>
              <p className="text-muted-foreground mt-2">Yes. It comes with limitations, but there is no cost to use it. No credit card required.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-lg">How does the Pro plan differ from Enterprise?</h3>
              <p className="text-muted-foreground mt-2">Enterprise includes team support, admin dashboard, and priority custom features designed for larger organizations.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold text-lg">Do you offer refunds?</h3>
              <p className="text-muted-foreground mt-2">Yes, we offer a 14-day money-back guarantee if you're not satisfied with our premium services.</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16 bg-juris-light/30 p-8 rounded-2xl max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-juris-primary mb-4">Need a custom solution?</h3>
          <p className="text-muted-foreground mb-6">Contact our sales team for a tailored solution that fits your specific requirements.</p>
          <Button className="bg-juris-primary hover:bg-juris-primary/90">Contact Us</Button>
        </div>

        <p className="text-sm text-center text-muted-foreground mt-16">
          This page is for demonstration purposes only. Billing integration coming soon.
        </p>
      </div>
    </>
  )
}