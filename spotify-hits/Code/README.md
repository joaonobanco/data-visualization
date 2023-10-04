## Structure
# Data Gathering and Processing

It was combined two music datasets to create a comprehensive dataset for the analysis.

The first [dataset](http://www.umdmusic.com/) contained weekly top 100 songs since 2000.

The second [dataset](https://data.world/typhon/billboard-hot-100-songs-2000-2018-w-spotify-data-lyrics) provided music metrics but had a limitation: it only included the last week for songs that spent several consecutive weeks on the chart. To merge these datasets, Python was used to match songs based on title and artist, handling encoding issues and complex matching conditions. The resulting file included music metrics and lyrics.

Text mining was performed on lyrics using the "NLTK" natural language package to analyze word count, unique words, lexical complexity, and identify the top 10 words (excluding stopwords and filtering profanity). Profane words were replaced with symbols. Additional columns were added to the dataset, such as word count, lexical complexity, and the top 10 words.

The final dataset contained data on the top 100 weekly songs from 2000 to 2018, totaling around 100,000 hits, including music metrics and lyrics. Three datasets were generated for visualization: [Top_100_songs.json](top_100_songs.json) (with repeated hits removed for ease of visualization), [aggregated.json](aggregated_genre.json) (aggregated by year and genre, including metrics, top artists, top hits, and top words), and [aggregated_genre.json]() (aggregated by genre). These datasets provide valuable insights into music trends and characteristics over time.
