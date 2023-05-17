import { useRouter } from 'next/router'
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react'
import { resolveBuilderContent } from '@lib/resolve-builder-content'
import '../../blocks/ProductView/ProductView.builder'
import builderConfig from '@config/builder'
import shopifyConfig from '@config/shopify'
import {
  getAllProductPaths,
  getProduct,
} from '@lib/shopify/storefront-data-hooks/src/api/operations'
import DefaultErrorPage from 'next/error'
import Head from 'next/head'
import { useThemeUI } from 'theme-ui'
import { getLayoutProps } from '@lib/get-layout-props'

builder.init(builderConfig.apiKey)

const builderModel = 'product-page'

export async function getStaticProps({ params, locale }) {
  const product = await getProduct(shopifyConfig, {
    handle: params?.handle,
  })

  const page = await resolveBuilderContent(builderModel, locale, {
    productHandle: params?.handle,
  })

  return {
    notFound: !product,
    revalidate: 30,
    props: {
      page: page,
      product: product,
      ...(await getLayoutProps()),
    },
  }
}

export async function getStaticPaths({ locales }) {
  const paths = await getAllProductPaths(shopifyConfig)
  return {
    paths: paths.map((path) => `/product/${path}`),
    fallback: 'blocking',
  }
}

export default function Handle({ product, page }) {
  const router = useRouter()
  const isLive = !useIsPreviewing()
  const { theme } = useThemeUI()
  
  if (!product && isLive) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex" />
          <meta name="title"></meta>
        </Head>
        <DefaultErrorPage statusCode={404} />
      </>
    )
  }

  return router.isFallback && isLive ? (
    <h1>Loading...</h1>
  ) : (
    <BuilderComponent
      isStatic
      key={product.id}
      model={builderModel}
      options={{ includeRefs: true }}
      data={{ product, theme }}
      content={page}
    />
  )
}
