# Break Norm

This is **Break Norm**! A web app developed with **Next.js** where you can bonk a chatbot named **Norm** on the head to make him run faster. Just be careful though: enough bonks and he might become more angry, rushed, and burned out.

The project was created around the theme **“Break the Norm”** by taking a normal AI chatbot and turning it into something more playful and reactive. Instead of being a calm assistant all the time, Norm responds to how the user treats him.

## Features

* Chat with Norm, an AI-powered chatbot
* Bonk Norm with a virtual baseball bat
* Rapid bonks increase Norm’s pressure level
* Higher pressure makes Norm respond faster
* Answer quality goes down as pressure increases
* Norm’s mood changes based on pressure
* Animated face that reacts to mood
* Blinking eyes and animated mouth while thinking
* Burnout mode when Norm is pushed too far
* Reset button to restore Norm back to normal

## How It Works

Norm has a pressure system. A single bonk mostly just plays the animation, but repeated bonks close together raise the pressure level.

As pressure increases:

```txt
Pressure goes up
Answer speed goes up
Answer quality goes down
Mood gets worse
```

This creates a tradeoff between speed and quality. The user can force Norm to respond faster, but the responses become shorter and less thoughtful.

## Mood System

Norm’s mood changes depending on the pressure level:

```txt
0 pressure      Calm
1-3 pressure    Slightly Pressured
4-6 pressure    Annoyed
7-8 pressure    Overworked
9-10 pressure   Burned Out
```

Norm’s face and the page styling change based on the current mood.

## Tech Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Google Gemini/Gemma API

## Setting Up the Project

Install all necessary dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root:

```env
GOOGLE_API_KEY=your_api_key_here
GEMMA_MODEL=your_model_name_here
```

Example:

```env
GOOGLE_API_KEY=your_api_key_here
GEMMA_MODEL=your_gemma_model_here
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```txt
break-norms
├── app
│   ├── api
│   │   └── chat
│   │       └── route.ts
│   ├── components
│   │   ├── Bat.tsx
│   │   └── NormFace.tsx
│   ├── page.tsx
│   └── globals.css
├── public
│   └── bat.png
├── .env.local
├── package.json
└── README.md
```

## Important Files

### `app/page.tsx`

Contains the main chatbot UI, message state, bonk logic, pressure system, mood system, and speed/quality meters.

### `app/components/NormFace.tsx`

Contains Norm’s animated face. The face changes depending on mood and animates while the chatbot is loading.

### `app/components/Bat.tsx`

Contains the baseball bat component used to bonk Norm.

### `app/api/chat/route.ts`

Handles the chatbot API request. It sends the user’s message, pressure level, quality level, and mood to the AI model.

## Troubleshooting

If the chatbot does not respond, check if:

* The API key is correct
* `.env.local` is in the project root
* The model name is available for your API key
* The development server was restarted after changing `.env.local`
