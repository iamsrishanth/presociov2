import type { J2VMovie } from '@/types';

/**
 * Hardcoded test Reel JSON for Stage 2+4 validation.
 * 3 scenes, 1080x1920, ~15 seconds total.
 * Uses solid color backgrounds + text overlays — no external image dependencies.
 */
export function getTestMovieJSON(): J2VMovie {
  return {
    resolution: 'instagram-story',
    quality: 'high',
    comment: 'Test Reel — Presocio MVP',
    scenes: [
      {
        comment: 'Hook scene',
        duration: 5,
        'background-color': '#1a1a2e',
        elements: [
          {
            type: 'text',
            text: 'AI Saves You 10 Hours a Week',
            'font-family': 'Montserrat',
            'font-size': 64,
            color: '#ffffff',
            'font-weight': 'bold',
            'text-align': 'center',
            width: 900,
            x: 90,
            y: 750,
            'fade-in': 0.5,
          },
          {
            type: 'text',
            text: 'Here\'s how',
            'font-family': 'Roboto',
            'font-size': 36,
            color: '#e94560',
            'text-align': 'center',
            width: 600,
            x: 240,
            y: 900,
            'fade-in': 1,
            start: 1,
          },
        ],
      },
      {
        comment: 'Key message scene',
        duration: 5,
        'background-color': '#16213e',
        elements: [
          {
            type: 'text',
            text: 'Automate repetitive tasks',
            'font-family': 'Montserrat',
            'font-size': 52,
            color: '#ffffff',
            'font-weight': 'bold',
            'text-align': 'center',
            width: 900,
            x: 90,
            y: 700,
            'fade-in': 0.5,
          },
          {
            type: 'text',
            text: 'Focus on what matters most',
            'font-family': 'Roboto',
            'font-size': 32,
            color: '#0f3460',
            'background-color': '#e94560',
            'text-align': 'center',
            width: 800,
            x: 140,
            y: 850,
            'fade-in': 0.5,
            start: 0.5,
          },
        ],
      },
      {
        comment: 'CTA scene',
        duration: 5,
        'background-color': '#0f3460',
        elements: [
          {
            type: 'text',
            text: 'Follow for more AI tips',
            'font-family': 'Oswald',
            'font-size': 56,
            color: '#ffffff',
            'font-weight': 'bold',
            'text-align': 'center',
            width: 900,
            x: 90,
            y: 750,
            'fade-in': 0.5,
          },
          {
            type: 'text',
            text: '@presocio',
            'font-family': 'Roboto',
            'font-size': 36,
            color: '#e94560',
            'text-align': 'center',
            width: 400,
            x: 340,
            y: 900,
            'fade-in': 0.5,
            start: 0.5,
          },
        ],
      },
    ],
  };
}

/**
 * Test caption for Stage 4 validation.
 */
export function getTestCaption(): string {
  return `AI is changing the game — are you keeping up?

Here's the truth: most professionals waste 10+ hours a week on tasks that could be automated. From email sorting to data entry, AI tools are quietly revolutionizing how we work.

The best part? You don't need to be a tech expert to start. Here are 3 simple ways AI can save you time TODAY.

What's your biggest time-waster at work? Drop it below 👇

#AITools #ProductivityHacks #WorkSmarter #Automation #FutureOfWork #TechTips #AIForBusiness #TimeManagement #DigitalTransformation #SmartWork`;
}
