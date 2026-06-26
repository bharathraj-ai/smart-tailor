'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, Filter, ShoppingBag, Eye, Scissors } from 'lucide-react';
import Image from 'next/image';

const categories = ['All', 'Women', 'Men', 'Kids', 'Accessories'];

const products = [
  { id: 1, name: 'Designer Silk Kurti', category: 'Women', price: 129.99, image: 'https://images.unsplash.com/photo-1583391733958-d25e07fac044?auto=format&fit=crop&q=80&w=800', rating: 4.8, reviews: 124 },
  { id: 2, name: 'Classic Tailored Suit', category: 'Men', price: 499.99, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800', rating: 4.9, reviews: 89 },
  { id: 3, name: 'Embroidered Lehenga', category: 'Women', price: 349.99, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', rating: 4.7, reviews: 56 },
  { id: 4, name: 'Cotton Summer Shirt', category: 'Men', price: 45.99, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ce3?auto=format&fit=crop&q=80&w=800', rating: 4.5, reviews: 42 },
  { id: 5, name: 'Bridal Saree Blouse', category: 'Women', price: 89.99, image: 'https://images.unsplash.com/photo-1615886753866-79396af44305?auto=format&fit=crop&q=80&w=800', rating: 4.9, reviews: 210 },
  { id: 6, name: 'Kids Ethnic Wear', category: 'Kids', price: 75.00, image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=800', rating: 4.6, reviews: 34 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function CategoriesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Explore Designs</h1>
          <p className="text-sm text-muted-foreground mt-1">Find the perfect style to customize to your measurements.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search designs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <button className="p-2 bg-card border border-border rounded-full hover:bg-secondary transition-colors text-foreground">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === category
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
              <Image 
                src={product.image} 
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
              />
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <button className="flex-1 bg-white text-black py-2.5 rounded-lg font-medium text-sm hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">
                    <Scissors className="w-4 h-4" /> Customize
                  </button>
                  <button className="w-10 h-10 bg-white/20 backdrop-blur-md border border-white/40 text-white rounded-lg flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Top Actions */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm text-foreground flex items-center justify-center hover:bg-white hover:text-red-500 transition-colors shadow-sm">
                  <Heart className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm text-foreground flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">{product.category}</p>
                  <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                </div>
                <span className="font-bold text-foreground">${product.price}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="font-medium text-foreground">{product.rating}</span>
                <span className="mx-1.5">•</span>
                <span>{product.reviews} reviews</span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No designs found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </motion.div>
  );
}
