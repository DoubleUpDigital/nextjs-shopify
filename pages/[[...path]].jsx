import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { BuilderComponent, Builder, builder, useIsPreviewing } from '@builder.io/react'
import builderConfig from '@config/builder'
import DefaultErrorPage from 'next/error'
import Head from 'next/head'
import { resolveBuilderContent } from '@lib/resolve-builder-content'
import { useThemeUI } from '@theme-ui/core'
import { getLayoutProps } from '@lib/get-layout-props'
import { useAddItemToCart } from '@lib/shopify/storefront-data-hooks'
import { useUI } from '@components/common/context'
import Link from '@components/common/Link'

builder.init(builderConfig.apiKey)
import '../blocks/ProductGrid/ProductGrid.builder'
import '../blocks/CollectionView/CollectionView.builder'

const isProduction = process.env.NODE_ENV === 'production'

export async function getStaticProps({ params, locale }) {
  const page = await resolveBuilderContent('page', locale, {
    urlPath: '/' + (params?.path?.join('/') || ''),
  })
  return {
    props: {
      page,
      locale,
      ...(await getLayoutProps()),
    },
    revalidate: 5,
  }
}

export async function getStaticPaths({ locales }) {
  return {
    paths: [],
    fallback: true,
  }
}

export default function Path({ page, locale }) {
  const router = useRouter()
  const { theme } = useThemeUI()
  const addToCart = useAddItemToCart()
  const isPreviewing = useIsPreviewing()
  const { openSidebar } = useUI()
  if (router.isFallback) {
    return <h1>Loading...</h1>
  }
  if (!page && !isPreviewing) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex" />
          <meta name="title"></meta>
        </Head>
        {Builder.isBrowser && <DefaultErrorPage statusCode={404} />}
      </>
    )
  }

  const { title, description, image } = page?.data || {}
  return (
    <div>
      {title && (
        <NextSeo
          title={title}
          description={description}
          openGraph={{
            type: 'website',
            title,
            description,
            locale,
            ...(image && {
              images: [
                {
                  url: image,
                  width: 800,
                  height: 600,
                  alt: title,
                },
              ],
            }),
          }}
        />
      )}
      <BuilderComponent
        options={{ includeRefs: true }}
        model="page"
        data={{ theme }}
        context={{
          productBoxService: {
            addToCart,
            navigateToCart() {
              openSidebar()
            },
            navigateToProductPage(product) {
              router.push(`/product/${product.handle}`)
            },
          },
        }}
        renderLink={(props) => {
          if (props.target === '_blank' || props.href?.startsWith('#')) {
            return <Link as="a" {...props} />
          }
          return <Link {...props} as={Link} />
        }}
        {...(page && { content: page })}
      />
    </div>
  )
}
