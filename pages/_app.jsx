import { useState } from 'react';
import Layout from '@components/common/Layout';
import { builder, Builder } from '@builder.io/react';
import builderConfig from '@config/builder';
import { SessionProvider } from 'next-auth/react';

builder.init(builderConfig.apiKey);

import '@builder.io/widgets';
import '../blocks/ProductGrid/ProductGrid.builder';
import '../blocks/CollectionView/CollectionView.builder';
import '../blocks/ProductView/ProductView.builder';
import '../blocks/CloudinaryImage/CloudinaryImage.builder';

Builder.register('insertMenu', {
  name: 'Shopify Collections Components',
  items: [
    { name: 'CollectionBox', label: 'Collection stuff' },
    { name: 'ProductCollectionGrid' },
    { name: 'CollectionView' },
  ],
});

Builder.register('insertMenu', {
  name: 'Shopify Products Components',
  items: [
    { name: 'ProductGrid' },
    { name: 'ProductBox' },
    { name: 'ProductView' },
  ],
});

Builder.register('insertMenu', {
  name: 'Cloudinary Components',
  items: [{ name: 'CloudinaryImage' }],
});

const Noop = ({ children }) => (
  <>{children}</>
);

export default function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Layout pageProps={pageProps}>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
