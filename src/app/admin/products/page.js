'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Plus, Trash2, Edit } from 'lucide-react';

export default function AdminProductsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><p className="text-muted-foreground">Loading products...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your product catalog by category.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><Package className="w-5 h-5 text-primary" /><span className="text-sm text-muted-foreground">Total Categories</span></div>
          <p className="text-2xl font-bold text-foreground">{categories.length}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><Package className="w-5 h-5 text-green-400" /><span className="text-sm text-muted-foreground">Active Products</span></div>
          <p className="text-2xl font-bold text-foreground">{categories.length}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">Product Catalog</h3>
          <a href="/admin/categories" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-4 h-4 inline mr-1" /> Add Category
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Image</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <img src={`/api/images/${cat.imageId}`} alt={cat.name} className="w-12 h-12 rounded-lg object-cover" />
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{cat.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{cat.slug}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(cat.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No products found. Add categories first.</div>
          )}
        </div>
      </div>
    </div>
  );
}
