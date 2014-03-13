Lithium Labs Visualization Components
=====================================

This is a set of D3 components that we developed as part of the Lithium Labs initiative.

## The Widgets

There are three widgets provided in this project.

### Sentiment Wave

The sentiment wave visualization is designed to show sentiment trends over time. The red band indicates negative sentiment, gray is neutral, and green is positive.

![Sentiment Wave](/images/sentiment_wave.png "Sentiment Wave")

You can also overlay a "subwave" over the original wave to show the contribution of a particular user or topic to the overall sentiment.

![Sentiment Waves With Subwave](/images/sentiment_wave_with_subwave.png "Sentiment Waves With Subwave")

This widget doesn't provide an X or Y axis. You need to handle that on your own.

### Reticule

The reticule is designed to be overlaid on other visualizations (like the Sentiment Wave) to provide more information about a particular day. You can adjust the number of slices, as well as the size of each slice and it's annotation. Within each slice is another set of red, green, and grey inner rings that you can use to show the number of negative, positive or neutral elements within that slice.

![Reticule](/images/reticule.png "Reticule")

### Elegant Waves

The elegant waves visualization is used to show several different metrics over time. The Y axis is normalized so that all of the waves display take up 100% of the axis even though there min/max ranges might be drastically different. The min and max are shown at the end of the graph.

![Elegant Waves](/images/elegant_waves.png "Elegant Waves")

A rollover is provided that shows the current values at the cursor location. In addition you can add indicators on top of the wave to show when important events happened that could be coincident with changes in various metrics.

## Important Directories

The directories that you need to know about are:

/src - This contains the source of the components

/dist - This contains an example application

Each component exists in both a Javascript class version, an as an AngularJS directive.

Please note that in order to look at the dist web page you need to install it in a webserver. On a Mac, for example, just go to the dist director and run:

`python -m SimpleHTTPServer 8000`

Then navigate to http://127.0.0.1:8000

