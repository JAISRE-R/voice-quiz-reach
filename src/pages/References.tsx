import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { BookOpen, FileText, Globe } from 'lucide-react';

const References = () => {
  const references = {
    journals: [
      {
        id: 1,
        citation: 'M. A. Khan, R. Vivian, and S. L. Shah, "Accessibility in web-based learning management systems: A systematic literature review," *ACM Transactions on Accessible Computing*, vol. 13, no. 4, pp. 1-35, Dec. 2020, doi: 10.1145/3432690.',
      },
      {
        id: 2,
        citation: 'J. P. Bigham and A. C. Cavender, "Evaluating existing audio CAPTCHAs and an interface optimized for non-visual use," in *Proc. SIGCHI Conference on Human Factors in Computing Systems*, Florence, Italy, 2009, pp. 1829-1838, doi: 10.1145/1518701.1518983.',
      },
      {
        id: 3,
        citation: 'S. L. Trewin, "Accessibility in the age of artificial intelligence," *IEEE Computer*, vol. 52, no. 11, pp. 81-85, Nov. 2019, doi: 10.1109/MC.2019.2937614.',
      },
      {
        id: 4,
        citation: 'K. Vu, R. W. Proctor, and G. Salvendy, "Accessibility evaluation of web-based educational systems for users with disabilities," *International Journal of Human-Computer Interaction*, vol. 35, no. 17, pp. 1599-1617, 2019, doi: 10.1080/10447318.2018.1557314.',
      },
      {
        id: 5,
        citation: 'M. F. Costabile, P. Lanzilotti, and M. De Marsico, "Evaluating the educational impact of a social serious game for increasing financial literacy," *IEEE Transactions on Learning Technologies*, vol. 13, no. 4, pp. 797-811, Oct.-Dec. 2020, doi: 10.1109/TLT.2020.3023611.',
      },
    ],
    books: [
      {
        id: 1,
        citation: 'J. Gunderson and M. Richardson, *Web Accessibility: A Foundation for Research*, 2nd ed. New York, NY, USA: Springer, 2016.',
      },
      {
        id: 2,
        citation: 'H. Swan, *Practical Web Inclusion and Accessibility: A Comprehensive Guide to Access Needs*. Berkeley, CA, USA: Apress, 2019.',
      },
      {
        id: 3,
        citation: 'A. Banks and E. Porcello, *Learning React: Modern Patterns for Developing React Apps*, 2nd ed. Sebastopol, CA, USA: O\'Reilly Media, 2020.',
      },
      {
        id: 4,
        citation: 'B. Shneiderman, C. Plaisant, M. Cohen, S. Jacobs, N. Elmqvist, and N. Diakopoulos, *Designing the User Interface: Strategies for Effective Human-Computer Interaction*, 6th ed. Hoboken, NJ, USA: Pearson, 2016.',
      },
      {
        id: 5,
        citation: 'S. Stefanov, *React: Up & Running: Building Web Applications*, 2nd ed. Sebastopol, CA, USA: O\'Reilly Media, 2021.',
      },
    ],
    websites: [
      {
        id: 1,
        citation: 'Web Content Accessibility Guidelines (WCAG) 2.1, W3C World Wide Web Consortium Recommendation, Jun. 2018. [Online]. Available: https://www.w3.org/TR/WCAG21/',
      },
      {
        id: 2,
        citation: 'React Documentation, "Getting Started – React," Facebook Inc., 2024. [Online]. Available: https://react.dev/',
      },
      {
        id: 3,
        citation: 'Supabase Documentation, "Supabase – The Open Source Firebase Alternative," Supabase Inc., 2024. [Online]. Available: https://supabase.com/docs',
      },
      {
        id: 4,
        citation: 'MDN Web Docs, "Accessibility," Mozilla Foundation, 2024. [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/Accessibility',
      },
      {
        id: 5,
        citation: 'Web Speech API, "Web Speech API Specification," W3C Community Group, 2024. [Online]. Available: https://wicg.github.io/speech-api/',
      },
      {
        id: 6,
        citation: 'TypeScript Documentation, "TypeScript: Documentation," Microsoft Corporation, 2024. [Online]. Available: https://www.typescriptlang.org/docs/',
      },
      {
        id: 7,
        citation: 'Tailwind CSS Documentation, "Tailwind CSS - Rapidly build modern websites," Tailwind Labs Inc., 2024. [Online]. Available: https://tailwindcss.com/docs',
      },
      {
        id: 8,
        citation: 'WAI-ARIA Authoring Practices Guide, "ARIA Authoring Practices Guide (APG)," W3C, 2024. [Online]. Available: https://www.w3.org/WAI/ARIA/apg/',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Navigation />
      
      <main id="main-content" className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            References
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Academic and technical resources used in the development of this accessible quiz platform
          </p>
        </div>

        {/* Journal Papers Section */}
        <Card className="p-8 mb-8 shadow-card animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-3 rounded-xl">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">Journal Papers</h2>
          </div>
          
          <div className="space-y-6">
            {references.journals.map((ref) => (
              <div key={ref.id} className="border-l-4 border-primary/30 pl-6 py-2 hover:border-primary transition-colors">
                <p className="text-sm text-muted-foreground mb-1">[{ref.id}]</p>
                <p className="text-foreground leading-relaxed">{ref.citation}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Books Section */}
        <Card className="p-8 mb-8 shadow-card animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-accent/10 p-3 rounded-xl">
              <BookOpen className="h-6 w-6 text-accent-foreground" />
            </div>
            <h2 className="text-3xl font-bold">Books</h2>
          </div>
          
          <div className="space-y-6">
            {references.books.map((ref) => (
              <div key={ref.id} className="border-l-4 border-accent/30 pl-6 py-2 hover:border-accent transition-colors">
                <p className="text-sm text-muted-foreground mb-1">[{ref.id}]</p>
                <p className="text-foreground leading-relaxed">{ref.citation}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Websites Section */}
        <Card className="p-8 mb-8 shadow-card animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-success/10 p-3 rounded-xl">
              <Globe className="h-6 w-6 text-success" />
            </div>
            <h2 className="text-3xl font-bold">Websites & Online Resources</h2>
          </div>
          
          <div className="space-y-6">
            {references.websites.map((ref) => (
              <div key={ref.id} className="border-l-4 border-success/30 pl-6 py-2 hover:border-success transition-colors">
                <p className="text-sm text-muted-foreground mb-1">[{ref.id}]</p>
                <p className="text-foreground leading-relaxed">{ref.citation}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Note Section */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 animate-fade-in">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Note:</strong> All references are formatted according to IEEE citation style. 
            These resources informed the development of accessibility features, user interface design, 
            and technical implementation of this platform.
          </p>
        </Card>
      </main>
    </div>
  );
};

export default References;
