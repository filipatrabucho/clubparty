import { useState, useEffect } from 'react';

const STOREFRONT_TOKEN = import.meta.env.VITE_FOURTHWALL_STOREFRONT_TOKEN;
const SHOP_URL = import.meta.env.VITE_FOURTHWALL_SHOP_URL;

export default function ShopProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://storefront-api.fourthwall.com/v1/collections/all/products?storefront_token=${STOREFRONT_TOKEN}`)
      .then(res => res.json())
      .then(data => setProducts(data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <section className="shop-products">
      <h2>Loja Club Party</h2>
      <p className="gallery-subtitle">Merch oficial — feito por encomenda, sem stock</p>
      <div className="shop-products-grid">
        {products.map(product => {
          const minPrice = Math.min(...product.variants.map(v => v.unitPrice.value));
          const currency = product.variants[0]?.unitPrice.currency || 'EUR';
          const image = product.images?.[0]?.transformedUrl || product.images?.[0]?.url;

          return (
            <a
              key={product.id}
              href={`${SHOP_URL}/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shop-product-card"
            >
              {image && <img src={image} alt={product.name} />}
              <div className="shop-product-info">
                <h3>{product.name}</h3>
                <span className="shop-product-price">
                  A partir de {minPrice.toFixed(2)} {currency}
                </span>
              </div>
            </a>
          );
        })}
      </div>
      <a href={SHOP_URL} target="_blank" rel="noopener noreferrer" className="button button-outline">
        Ver loja completa
      </a>
    </section>
  );
}