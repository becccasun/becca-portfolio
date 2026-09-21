"use client";

import { useState } from "react";
import styles from "./InteractiveDemo.module.css";

export default function InteractiveDemo({
  src,
  title,
  fallbackSrc,
  fallbackAlt,
  caption,
}: {
  src: string;
  title: string;
  fallbackSrc: string;
  fallbackAlt: string;
  caption?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <figure className={styles.demo}>
      <div className={styles.frame}>
        {!failed && (
          <iframe
            src={src}
            title={title}
            loading="lazy"
            sandbox="allow-forms allow-modals allow-popups allow-scripts"
            referrerPolicy="no-referrer"
            className={`${styles.iframe} ${loaded ? styles.iframeLoaded : ""}`}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
        <div
          className={`${styles.fallback} ${
            loaded && !failed ? styles.fallbackLoaded : ""
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fallbackSrc} alt={fallbackAlt} />
          <div className={styles.fallbackAction}>
            <p>
              {failed
                ? "The embedded prototype could not load."
                : "Open the full prototype for the best mobile experience."}
            </p>
            <a href={src} target="_blank" rel="noopener noreferrer">
              Open interactive prototype
            </a>
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <a href={src} target="_blank" rel="noopener noreferrer">
          Open prototype in a new tab
        </a>
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
