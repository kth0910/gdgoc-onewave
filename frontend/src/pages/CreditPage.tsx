import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreditPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 font-display">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100">
        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
           <span className="material-symbols-outlined text-4xl">payments</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Charge Credits</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Need more generation power? <br/>
          Purchase credits to create more amazing videos.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
            <button className="p-4 border-2 border-primary/10 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group">
                <span className="block text-2xl font-black text-slate-800 group-hover:text-primary">100</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credits</span>
                <span className="block mt-2 text-primary font-bold">$100</span>
            </button>
            <button className="p-4 border-2 border-primary/10 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group">
                <span className="block text-2xl font-black text-slate-800 group-hover:text-primary">500</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credits</span>
                <span className="block mt-2 text-primary font-bold">$490</span>
            </button>
        </div>

        <button 
            onClick={() => alert("Payment integration coming soon!")}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-primary/20 mb-4"
        >
            Proceed to Checkout
        </button>
        
        <button 
            onClick={() => navigate('/app')}
            className="text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm"
        >
            Cancel and Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default CreditPage;
