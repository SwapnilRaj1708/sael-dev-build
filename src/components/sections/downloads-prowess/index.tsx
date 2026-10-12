import {
  ProductDownloadsLayout,
  type ProductDownloadsLayoutProps,
} from '@/components/sections/product-downloads';
import { ValueGridLayout, type ValueGridLayoutProps } from '@/components/sections/value-grid';
import { Section } from '@/components/ui/section';
import { cn } from '@/lib/utils/cn';

export interface DownloadsProwessProps {
  /** The product datasheets: heading and list. */
  downloads: ProductDownloadsLayoutProps;
  /** The cards under them — "Manufacturing Prowess". */
  prowess: ValueGridLayoutProps;
  /**
   * Opt into the page's section snapping — a screen tall, content centred,
   * on the tight rhythm. See `data-snap-sections` in globals.css.
   */
  snap?: boolean;
}

/**
 * Module Manufacturing's Product Downloads and Manufacturing Prowess, as one
 * section — the client's request of 2026-10-12. Each was a screen of its own
 * until then, and both are short, so the page snapped onto two screens that
 * were mostly empty. Merged, they share one, with no change to either's
 * content. The live page's order is kept: the datasheets, then the cards.
 *
 * It composes the two sections' own layouts — `<ProductDownloadsLayout>` and
 * `<ValueGridLayout>` — rather than redrawing them, so each stays one
 * component wherever it is used. The same move Our Key ESG Metrics'
 * `<ReportingStakeholders>` makes.
 *
 * The two halves sit `--spacing-section-y-tight` apart, more than any gap
 * inside either, so the second heading reads as a new part rather than a
 * continuation of the first.
 *
 * `overflow-x-clip` because the prowess cards are outlined, and an outlined
 * card's hover gradient reaches past the viewport's edge on a phone — see
 * `<ValueGrid>`.
 *
 * A Server Component; only the reveals are client.
 */
export function DownloadsProwess({ downloads, prowess, snap = false }: DownloadsProwessProps) {
  return (
    <Section
      background="black-dots"
      spacing={snap ? 'tight' : 'default'}
      data-snap-section
      className={cn('overflow-x-clip', snap && 'flex min-h-viewport snap-start items-center')}
    >
      <div className="flex w-full flex-col gap-section-y-tight">
        <ProductDownloadsLayout {...downloads} />
        <ValueGridLayout {...prowess} />
      </div>
    </Section>
  );
}
