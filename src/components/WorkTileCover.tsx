"use client";

import { useRef, useState } from "react";
import styles from "./WorkGrid.module.css";

/**
 * A tile's frame: the still by default, the clip while the pointer is on
 * it. The video carries preload="none", so a visitor who never hovers
 * never downloads it — which is the whole reason this isn't an animated
 * image. The still stays mounted underneath rather than being swapped
 * out, so there is no gap on the first frame or if the clip fails.
 */
export default function WorkTileCover({
  image,
  video,
  fallback,
}: {
  image?: string;
  video?: string;
  /** Shown when a project has no art at all. */
  fallback: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function start() {
    const el = ref.current;
    if (!el) return;
    // Someone who asked for less motion gets the still, the same way the
    // cursor and the page transitions bow out.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Nothing is revealed here: the fade waits for the playing event, so a
    // clip that is still fetching never shows as an empty frame over the
    // still. Autoplay can also be refused outright (low power mode, for
    // one), and then that event simply never comes.
    el.play().catch(() => setPlaying(false));
  }

  function stop() {
    const el = ref.current;
    setPlaying(false);
    if (!el) return;
    el.pause();
    // Back to the first frame, so the next hover starts the story over
    // instead of resuming mid-sentence.
    el.currentTime = 0;
  }

  return (
    <div
      className={styles.cover}
      onPointerEnter={video ? start : undefined}
      onPointerLeave={video ? stop : undefined}
    >
      {image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={image} alt="" loading="lazy" />
      ) : (
        <span className={`serif ${styles.coverFallback}`}>{fallback}</span>
      )}

      {video && (
        <video
          ref={ref}
          className={`${styles.coverVideo} ${playing ? styles.coverVideoOn : ""}`}
          src={video}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
        />
      )}
    </div>
  );
}
