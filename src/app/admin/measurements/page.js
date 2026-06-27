'use client';

import { useState, useEffect } from 'react';
import { Ruler, Search, User } from 'lucide-react';
import { cachedFetch } from '@/lib/apiCache';

export default function AdminMeasurementsPage() {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      const data = await cachedFetch('/api/admin/measurements', {}, 300);
      setMeasurements(data.measurements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = measurements.filter(m =>
    m.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center p-12"><p className="text-muted-foreground">Loading measurements...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Measurements</h1>
        <p className="text-sm text-muted-foreground mt-1">View all customer measurement profiles.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><Ruler className="w-5 h-5 text-primary" /><span className="text-sm text-muted-foreground">Total Profiles</span></div>
          <p className="text-2xl font-bold text-foreground">{measurements.length}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><User className="w-5 h-5 text-blue-400" /><span className="text-sm text-muted-foreground">Unique Customers</span></div>
          <p className="text-2xl font-bold text-foreground">{new Set(measurements.map(m => m.userId)).size}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by customer name or profile name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="bg-card border border-border p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {m.user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold text-foreground">{m.user?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{m.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {m.chest && <div><span className="text-muted-foreground">Chest:</span> <span className="text-foreground font-medium">{m.chest}"</span></div>}
              {m.waist && <div><span className="text-muted-foreground">Waist:</span> <span className="text-foreground font-medium">{m.waist}"</span></div>}
              {m.hip && <div><span className="text-muted-foreground">Hip:</span> <span className="text-foreground font-medium">{m.hip}"</span></div>}
              {m.shoulder && <div><span className="text-muted-foreground">Shoulder:</span> <span className="text-foreground font-medium">{m.shoulder}"</span></div>}
              {m.sleeveLength && <div><span className="text-muted-foreground">Sleeve:</span> <span className="text-foreground font-medium">{m.sleeveLength}"</span></div>}
              {m.neckSize && <div><span className="text-muted-foreground">Neck:</span> <span className="text-foreground font-medium">{m.neckSize}"</span></div>}
              {m.height && <div><span className="text-muted-foreground">Height:</span> <span className="text-foreground font-medium">{m.height}"</span></div>}
            </div>
            {m.customNotes && (() => {
              const parts = m.customNotes.split('|||');
              const noteText = parts[0];
              const imageBase64 = parts[1];
              return (
                <div className="mt-3 text-xs text-muted-foreground border-t border-border pt-3">
                  {noteText && <p><strong>Notes:</strong> {noteText}</p>}
                  {imageBase64 && (
                    <div className="mt-2">
                      <p className="font-semibold mb-1 text-foreground">Reference Image:</p>
                      <a href={imageBase64} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <img src={imageBase64} alt="Reference design" className="max-w-[120px] max-h-[120px] object-cover rounded-lg border border-border" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })()}
            <p className="mt-3 text-xs text-muted-foreground">Created: {new Date(m.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">No measurements found.</div>
        )}
      </div>
    </div>
  );
}
