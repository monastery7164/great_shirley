import Footer from '@/components/Footer';
import LoadingDots from '@/components/LoadingDots';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRef, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';

const applicationName = 'Generate your next Twitter bio using chatGPT';
const hint = 'Copy your current bio (or write a few sentences about yourself).';
const demoInput =
  'e.g. Senior Developer Advocate @vercel. Tweeting about web development, AI, and React / Next.js. Writing nutlope.substack.com.';
const applicationPrompt =
  'Generate 1 Professional twitter biographies with no hashtags and clearly Make sure generated biography is less than 160 characters, has short sentences that are found in Twitter bios, and base them on this context: ';

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [generatedResults, setGeneratedResults] = useState<string>('');

  const resultRef = useRef<null | HTMLDivElement>(null);

  const scrollToResults = () => {
    if (resultRef.current !== null) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const prompt = `${applicationPrompt} ${userInput}`;

  const generateResult = async (e: any) => {
    if (loading) {
      return;
    }

    e.preventDefault();
    setGeneratedResults('');
    setLoading(true);
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setGeneratedResults((prev) => prev + chunkValue);
    }
    scrollToResults();
    setLoading(false);
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>{applicationName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
          {applicationName}
        </h1>

        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <p className="text-left font-medium">{hint}</p>
          </div>

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={demoInput}
          />

          <button
            className="bg-black rounded-xl text-white font-medium px-8 py-2 sm:mt-10 mt-8 hover:bg-black/80"
            onClick={(e) => generateResult(e)}
            disabled={loading}
          >
            {loading ? <LoadingDots color="white" style="large" /> : '运行'}
          </button>
        </div>

        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />

        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10">
          {generatedResults && (
            <>
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={resultRef}
                >
                  运行结果
                </h2>
              </div>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                <div
                  className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedResults);
                    toast('Result copied to clipboard', {
                      icon: '✂️',
                    });
                  }}
                >
                  <p>{generatedResults}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;