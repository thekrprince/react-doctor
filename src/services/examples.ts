export interface DiagnosticIssue {
  issue: string;
  severity: 'high' | 'medium' | 'low';
  solution: string;
  line?: number;
}

export interface DiagnosticResult {
  score: number;
  summary: string;
  categories: {
    performance: DiagnosticIssue[];
    a11y: DiagnosticIssue[];
    bestPractices: DiagnosticIssue[];
    security: DiagnosticIssue[];
    bundle: DiagnosticIssue[];
  };
  refactoredCode: string;
}

export interface CodeExample {
  id: string;
  name: string;
  description: string;
  code: string;
  mockResult: DiagnosticResult;
}

export const EXAMPLES: CodeExample[] = [
  {
    id: 'counter',
    name: 'Unoptimized Counter (Performance & Hook Bloat)',
    description: 'A component with bad hooks, missing useCallback/useMemo, array index keys, and infinite render triggers.',
    code: `import React, { useState, useEffect } from 'react';

export default function UnoptimizedCounter({ items }) {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);

  // Problem 1: Infinite render loop trigger - updating state inside useEffect without condition
  useEffect(() => {
    const list = items.map(x => x * 2);
    setData(list);
  }); 

  // Problem 2: Inline function inside render without useCallback
  const handleReset = () => {
    setCount(0);
  };

  // Problem 3: Complex calculation on every render without useMemo
  const sortedData = data.sort((a, b) => b - a);

  return (
    <div>
      <h3>Counter: {count}</h3>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={handleReset}>Reset</button>

      <ul>
        {/* Problem 4: Using index as key */}
        {sortedData.map((item, index) => (
          <li key={index}>Item: {item}</li>
        ))}
      </ul>
    </div>
  );
}`,
    mockResult: {
      score: 42,
      summary: "The component has severe performance issues, including an infinite render loop in a useEffect hook and sorting an array on every render without memoization. It also uses array indices as React keys, which can lead to rendering bugs.",
      categories: {
        performance: [
          {
            issue: "Infinite render loop in useEffect.",
            severity: "high",
            solution: "Add a dependency array to the useEffect hook (e.g., `[items]`) so it only runs when props change, rather than on every render.",
            line: 7
          },
          {
            issue: "Sorting array on every single render.",
            severity: "medium",
            solution: "Wrap the sorting logic in `useMemo` with `[data]` in the dependency array to prevent recalculation on unrelated renders.",
            line: 18
          },
          {
            issue: "Function recreation on every render.",
            severity: "low",
            solution: "Wrap `handleReset` in `useCallback` to maintain a stable reference and prevent children from re-rendering.",
            line: 13
          }
        ],
        a11y: [
          {
            issue: "Generic button element missing context.",
            severity: "low",
            solution: "While buttons are native, adding an aria-label or explicit context ensures screen readers correctly convey the action.",
            line: 23
          }
        ],
        bestPractices: [
          {
            issue: "Using array index as key in list render.",
            severity: "high",
            solution: "Use a unique identifier from the items (e.g., `item.id`) rather than the array index, which can cause component state bugs during re-ordering.",
            line: 28
          }
        ],
        security: [],
        bundle: []
      },
      refactoredCode: `import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface UnoptimizedCounterProps {
  items: number[];
}

export default function OptimizedCounter({ items }: UnoptimizedCounterProps) {
  const [count, setCount] = useState(0);
  const [data, setData] = useState<number[]>([]);

  // Fixed: Added dependency array to prevent infinite rendering loop
  useEffect(() => {
    const list = items.map(x => x * 2);
    setData(list);
  }, [items]); 

  // Fixed: Wrapped in useCallback to preserve function identity
  const handleReset = useCallback(() => {
    setCount(0);
  }, []);

  // Fixed: Wrapped in useMemo to prevent sorting on every render
  const sortedData = useMemo(() => {
    // Note: slice() is called to avoid mutating state directly
    return [...data].sort((a, b) => b - a);
  }, [data]);

  return (
    <div className="counter-container">
      <h3>Counter: {count}</h3>
      <div className="button-group">
        <button onClick={() => setCount(prev => prev + 1)}>Increment</button>
        <button onClick={handleReset}>Reset</button>
      </div>

      <ul className="item-list">
        {/* Fixed: If items don't have IDs, create string key composed of value and index */}
        {sortedData.map((item, index) => (
          <li key={\`item-\${item}-\${index}\`}>Item: {item}</li>
        ))}
      </ul>
    </div>
  );
}`
    }
  },
  {
    id: 'insecure',
    name: 'Insecure Profile (Security & Accessibility)',
    description: 'A component with raw dangerouslySetInnerHTML usage, missing image alt text, and invalid keyboard focus targets.',
    code: `import React from 'react';

export default function UserProfile({ user }) {
  const bioHtml = user.bio || '<p>No bio provided</p>';

  return (
    <div onClick={() => console.log('clicked profile')}>
      {/* Problem 1: Image missing alt text */}
      <img src={user.avatarUrl} width="100" />
      
      <h2>{user.name}</h2>
      
      {/* Problem 2: Insecure HTML injection */}
      <div dangerouslySetInnerHTML={{ __html: bioHtml }} />

      {/* Problem 3: Fake button without keyboard support */}
      <div 
        className="fake-button" 
        onClick={() => window.open(\`/chat/\${user.id}\`)}
      >
        Send Message
      </div>
    </div>
  );
}`,
    mockResult: {
      score: 30,
      summary: "This component has critical security vulnerabilities due to raw HTML injection and significant accessibility issues, including an image missing alt tags and a click handler on a non-interactive element lacking keyboard access.",
      categories: {
        performance: [],
        a11y: [
          {
            issue: "Image missing alt text.",
            severity: "high",
            solution: "Add a meaningful `alt` attribute describing the image (e.g. `alt={user.name}`), or an empty `alt=\"\"` if purely decorative.",
            line: 8
          },
          {
            issue: "Interactive click handler on div (Fake Button).",
            severity: "high",
            solution: "Change the `div` to a native `<button>` element or add `role=\"button\"`, `tabIndex={0}`, and an `onKeyDown` handler.",
            line: 16
          },
          {
            issue: "Non-interactive main wrapper div has click handler.",
            severity: "medium",
            solution: "If the wrapper is meant to be clickable, use a semantic element or add appropriate focus roles and keyboard accessibility handlers.",
            line: 6
          }
        ],
        bestPractices: [],
        security: [
          {
            issue: "dangerouslySetInnerHTML vulnerable to Cross-Site Scripting (XSS).",
            severity: "high",
            solution: "Sanitize the HTML using a library like `dompurify` before inserting, or render standard text if formatting is not required.",
            line: 13
          }
        ],
        bundle: []
      },
      refactoredCode: `import React from 'react';
import DOMPurify from 'dompurify'; // Recommended dependency for sanitization

interface User {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
}

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  // Fixed: Sanitize the HTML string to prevent XSS injection
  const bioHtml = DOMPurify.sanitize(user.bio || '<p>No bio provided</p>');

  const handleProfileClick = () => {
    console.log('clicked profile');
  };

  const handleSendMessage = () => {
    window.open(\`/chat/\${user.id}\`);
  };

  return (
    <div 
      className="profile-card"
      onClick={handleProfileClick}
      role="region"
      aria-label="User Profile"
    >
      {/* Fixed: Added alt attribute for accessibility */}
      <img 
        src={user.avatarUrl} 
        alt={\`Avatar image of \${user.name}\`} 
        width="100" 
        className="profile-avatar"
      />
      
      <h2>{user.name}</h2>
      
      {/* Fixed: Injected HTML is now sanitized */}
      <div 
        className="profile-bio" 
        dangerouslySetInnerHTML={{ __html: bioHtml }} 
      />

      {/* Fixed: Transformed fake button into semantic accessible button */}
      <button 
        className="message-button" 
        onClick={handleSendMessage}
        type="button"
      >
        Send Message
      </button>
    </div>
  );
}`
    }
  },
  {
    id: 'heavy',
    name: 'Heavy Dashboard (Bundle & Leak Bloat)',
    description: 'A component with a massive Lodash library import, custom scrollbar wrappers, and memory leaks with intervals.',
    code: `import React, { useState, useEffect } from 'react';
import _ from 'lodash'; // Problem 1: Wildcard full lodash import

export default function HeavyDashboard() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Problem 2: Memory leak - setInterval never cleared
  useEffect(() => {
    setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
  });

  const heavyData = Array.from({ length: 5000 }, (_, i) => ({
    id: i,
    name: \`User \${i}\`,
    score: Math.floor(Math.random() * 100)
  }));

  // Problem 3: Inefficient lodash filtering inside render
  const highScores = _.filter(heavyData, (u) => u.score > 80);

  return (
    <div style={{ padding: '20px', background: '#222' }}>
      <h1>Dashboard - {time}</h1>
      <p>High Score Count: {highScores.length}</p>
    </div>
  );
}`,
    mockResult: {
      score: 51,
      summary: "This component imports the entire lodash library instead of specific functions, leading to unnecessary bundle bloat. Additionally, there is a memory leak because the clock interval is never cleared on unmount, and the array calculations are processed on every render.",
      categories: {
        performance: [
          {
            issue: "Memory leak from un-cleared setInterval.",
            severity: "high",
            solution: "Store the interval ID and return a cleanup function in `useEffect` that calls `clearInterval`.",
            line: 8
          },
          {
            issue: "Array generated and filtered on every render.",
            severity: "medium",
            solution: "Wrap `heavyData` and `highScores` in `useMemo` so they are only calculated once, or move them outside the component if static.",
            line: 14
          }
        ],
        a11y: [],
        bestPractices: [
          {
            issue: "Inline styles used on container.",
            severity: "low",
            solution: "Move styles to an external CSS stylesheet or CSS Modules to improve code readability and component isolation.",
            line: 23
          }
        ],
        security: [],
        bundle: [
          {
            issue: "Full lodash library wildcard import.",
            severity: "high",
            solution: "Import specific functions directly, e.g., `import filter from 'lodash/filter'` or use native ES6 array methods `heavyData.filter(...)` to eliminate lodash entirely.",
            line: 2
          }
        ]
      },
      refactoredCode: `import React, { useState, useEffect, useMemo } from 'react';

// Fixed: Removed lodash import entirely and used native Array methods!

export default function OptimizedHeavyDashboard() {
  const [time, setTime] = useState('');

  // Fixed: Standardized useEffect with empty dependencies and added cleanup
  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const intervalId = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Fixed: Memoized high-overhead data array generation
  const heavyData = useMemo(() => {
    return Array.from({ length: 5000 }, (_, i) => ({
      id: i,
      name: \`User \${i}\`,
      score: Math.floor(Math.random() * 100)
    }));
  }, []);

  // Fixed: Memoized scoring calculation and replaced lodash with native .filter()
  const highScores = useMemo(() => {
    return heavyData.filter((user) => user.score > 80);
  }, [heavyData]);

  return (
    <div className="dashboard-container">
      <h1>Dashboard - {time}</h1>
      <p>High Score Count: {highScores.length}</p>
    </div>
  );
}`
    }
  }
];
