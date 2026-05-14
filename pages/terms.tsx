import Head from 'next/head';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service • GATED</title>
        <meta name="description" content="Terms of service for GATED secure access." />
      </Head>

      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f7f9ff] to-[#eef3fb] p-6">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-extrabold text-[#0f225b]">Terms of Service</h1>
          <p className="mt-4 text-[#5d6f97]">This is a placeholder Terms of Service page. Replace this with your application's terms.</p>

          <div className="mt-6">
            <Link href="/" className="text-primary-700 font-semibold hover:underline">Back to main portal</Link>
          </div>
        </div>
      </main>
    </>
  );
}
