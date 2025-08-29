
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { RoadmapModule } from '../types';
import { AwardIcon } from './icons/AwardIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface CertificateViewProps {
  courseName: string;
  roadmap: RoadmapModule[];
}

const CertificateView: React.FC<CertificateViewProps> = ({ courseName, roadmap }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const completionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDownload = () => {
    if (certificateRef.current) {
      html2canvas(certificateRef.current, {
        useCORS: true,
        scale: 2, // for better resolution
        backgroundColor: '#ffffff',
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `Sikho_Certificate_${courseName.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl shadow-lg border border-slate-200 p-8 animate-fade-in">
      <div
        ref={certificateRef}
        className="w-full max-w-4xl p-10 bg-white border-4 border-indigo-200 rounded-lg"
        style={{ backgroundImage: 'radial-gradient(#f1f5f9 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      >
        <div className="text-center border-b-2 border-slate-300 pb-4">
            <AwardIcon className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-800">Certificate of Completion</h1>
          <p className="text-lg text-slate-600 mt-2">This certifies the successful completion of the course on</p>
        </div>
        <div className="text-center my-8">
          <h2 className="text-5xl font-extrabold text-indigo-700 tracking-tight">{courseName}</h2>
        </div>
        <div className="text-center">
          <p className="text-md text-slate-500">Presented by</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">Sikho AI</h3>
          <p className="text-md text-slate-500 mt-4">on this day</p>
          <p className="text-xl font-semibold text-slate-700">{completionDate}</p>
        </div>
         <div className="mt-8 pt-4 border-t-2 border-slate-300">
            <h4 className="text-center font-semibold text-slate-700 mb-3">Modules Completed:</h4>
            <ul className="text-center text-slate-600 text-sm columns-2">
                {roadmap.map(module => <li key={module.title} className="mb-1">{module.title}</li>)}
            </ul>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="mt-8 flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-md text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
      >
        <DownloadIcon className="h-6 w-6 mr-3" />
        Download Certificate
      </button>
    </div>
  );
};

export default CertificateView;
