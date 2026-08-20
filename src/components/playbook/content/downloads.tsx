import { ASSET_COUNT, ASSET_GROUPS } from '../assets';
import { Block, Callout, DownloadList, Mono, P, Rules } from '../ui';

/**
 * Every deliverable in the repository. The list is generated from what is
 * actually on disk — see src/components/playbook/assets.ts.
 */
export function DownloadsContent() {
  const totalBytes = ASSET_GROUPS.reduce(
    (n, g) => n + g.files.reduce((m, f) => m + f.bytes, 0),
    0,
  );

  return (
    <>
      <Block
        id="index"
        title={`${ASSET_COUNT} files`}
        intro={
          <>
            Everything below is served from <Mono>/assets/</Mono> and exists in the repository —
            nothing here is a placeholder or a promise. Roughly{' '}
            {(totalBytes / 1024 / 1024).toFixed(1)} MB in total.
          </>
        }
      >
        <Rules
          items={[
            <>
              <strong>Prefer the SVG.</strong> Reach for a PNG only where the medium refuses vector.
            </>,
            <>
              <strong>Never scale a PNG up.</strong> Pick the size at or above the size it will be
              rendered at.
            </>,
            <>
              <strong>Never recolour a file.</strong> The colourway you need is already here; if it
              is not, it is not an approved colourway.
            </>,
            <>
              <strong>Regenerate rather than edit.</strong> Every file is built by{' '}
              <Mono>npm run assets</Mono> from the geometry in <Mono>src/brand/Logo.tsx</Mono> and
              the token definitions. A hand-edited asset will be silently overwritten.
            </>,
          ]}
        />
      </Block>

      {ASSET_GROUPS.map((group) => (
        <Block key={group.label} id={slug(group.label)} title={group.label}>
          <DownloadList group={group} />
        </Block>
      ))}

      <Block id="fonts-licence" title="Type licensing">
        <P>
          All three families — Newsreader, Hanken Grotesk and JetBrains Mono — are licensed under the
          SIL Open Font License 1.1. That permits embedding, redistribution and use in commercial
          work, and it requires the licence to travel with the fonts.
        </P>
        <Callout title="Ship the licence with the fonts">
          If you copy the <Mono>woff2</Mono> files into another project, copy{' '}
          <Mono>LICENSE-OFL.txt</Mono> alongside them. This is a condition of the licence, not a
          courtesy. The reserved font names may not be used for modified versions.
        </Callout>
      </Block>

      <Block id="regenerating" title="Regenerating the assets">
        <P>
          The asset pipeline is idempotent and safe to re-run. It downloads the fonts, rebuilds the
          logo variants, rasterises the PNG set, builds the favicons, and regenerates the base64
          font payload used by the export pipeline.
        </P>
        <div className="overflow-x-auto rounded-lg border border-line bg-surface-2 p-4">
          <pre className="m-0 font-mono text-fg-1" style={{ fontSize: 12, lineHeight: 1.7 }}>
{`npm run assets           # everything below, in order
npm run assets:fonts     # download woff2 + write fonts.css
npm run assets:logos     # SVG variants, wordmark outlined
npm run assets:pngs      # PNG sizes + favicon set
npm run assets:embed     # base64 font payload for export

npm run verify:assets    # fails if anything is missing or drifted
npm run check:subsets    # which glyphs the bundled fonts actually carry`}
          </pre>
        </div>
        <P>
          <Mono>verify:assets</Mono> runs automatically before every build. It checks that each file
          exists and is non-empty, that the fonts are genuinely woff2, that the licence covers all
          three families, and that the palette and logo geometry still match the imported source.
        </P>
      </Block>
    </>
  );
}

function slug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
