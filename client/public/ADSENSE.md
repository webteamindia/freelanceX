# AdSense setup

Before enabling ads in production:

1. Set `NEXT_PUBLIC_ADSENSE_CLIENT` and slot env vars in Vercel.
2. Replace the placeholder line in `ads.txt` with your real publisher id:

   ```
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```

   Use the id from your AdSense account (Ads → Account → Account information).
