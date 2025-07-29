import React from 'react';
import { Link } from 'react-router-dom';

const MobileReadingDemo: React.FC = () => {
    return (
        <div className="bg-background min-h-screen">
            {/* Mobile: Edge-to-edge layout */}
            <div className="md:hidden">
                {/* Hero Image - Full width */}
                <div className="w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-center text-white">
                        <h1 className="text-2xl font-bold mb-2">Mobile-First Reading</h1>
                        <p className="text-blue-100">Edge-to-edge, fluid experience</p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 py-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">
                        No More Boxed Reading Experience
                    </h2>
                    
                    <div className="space-y-4 text-foreground">
                        <p>
                            This demonstrates the new mobile-fluid reading experience. Notice how:
                        </p>
                        
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Images extend edge-to-edge for immersive viewing</li>
                            <li>• Content has minimal padding for maximum reading width</li>
                            <li>• No card borders or shadows that create "boxes"</li>
                            <li>• Clean, magazine-style layout optimized for mobile</li>
                            <li>• Seamless scrolling without visual interruptions</li>
                        </ul>
                        
                        <p>
                            The design automatically switches to the traditional boxed layout on desktop 
                            screens while providing this fluid, edge-to-edge experience on mobile devices.
                        </p>
                    </div>
                </div>

                {/* Sample Content Sections */}
                <div className="border-t border-border">
                    <div className="px-4 py-6">
                        <h3 className="text-lg font-semibold text-foreground mb-3">
                            Sample Article Section
                        </h3>
                        <p className="text-foreground leading-relaxed mb-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
                            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
                            quis nostrud exercitation ullamco laboris.
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Notice how the text flows naturally without being constrained by card boundaries.
                        </p>
                    </div>
                </div>

                {/* Full-width image example */}
                <div className="w-full h-48 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                    <span className="text-white font-medium">Full-width content area</span>
                </div>

                <div className="px-4 py-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                        Continued Reading
                    </h3>
                    <p className="text-foreground leading-relaxed">
                        The content continues seamlessly, creating a natural reading flow that 
                        feels more like a native mobile app than a traditional website.
                    </p>
                </div>

                {/* Navigation */}
                <div className="px-4 py-6 border-t border-border bg-muted/30">
                    <Link 
                        to="/" 
                        className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>

            {/* Desktop: Show comparison */}
            <div className="hidden md:block max-w-4xl mx-auto px-6 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                        Mobile Reading Experience Demo
                    </h1>
                    <p className="text-muted-foreground">
                        This page demonstrates the mobile-fluid reading experience. 
                        Resize your browser to mobile width or view on a mobile device to see the difference.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-card border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-3">Traditional Boxed Layout</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Cards with borders and shadows</li>
                            <li>• Constrained content width</li>
                            <li>• Padding creates "boxes"</li>
                            <li>• Good for desktop, cramped on mobile</li>
                        </ul>
                    </div>

                    <div className="bg-card border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-3">Mobile-Fluid Layout</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Edge-to-edge images and content</li>
                            <li>• Maximum reading width</li>
                            <li>• Minimal visual barriers</li>
                            <li>• Optimized for mobile consumption</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link 
                        to="/" 
                        className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MobileReadingDemo;
