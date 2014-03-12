class window.SentimentWave
	constructor: ( @parent, @width, @height, @data ) ->
		layer_info = @buildLayers( @data )

		@svg = d3.select( @parent )
			.append('svg')
			.attr('width', @width)
			.attr('height', @height)

		@colors = ['#ff6666','#aaaaaa','#66ff66']

		@svg
			.selectAll('path.main')
			.data(layer_info.layers)
			.enter()
			.append('path')
			.attr(
				d: layer_info.area
				class: 'main'
			)
			.style 'fill', ( d, i ) =>
				@colors[ i ]

	subwave: ( wave ) ->
		layer_info = @buildLayers( @data, wave )
		@svg
			.selectAll('path.main')
			.style('opacity', 0.2)
		@svg
			.selectAll('path.subwave')
			.data(layer_info.layers)
			.enter()
			.append('path')
			.attr(
				d: layer_info.area
				class: 'subwave'
			)
			.attr('d', layer_info.area)
			.attr('transform', "translate(0,-#{layer_info.offset})")
			.style(
				fill: ( d, i ) => @colors[ i ]
				opacity: 1
			)

	findMax: ( data ) ->
		dmax = 0
		for d in data
			if d?
				dmax = d.positive if ( d.positive > dmax )
				dmax = d.neutral if ( d.neutral > dmax )
				dmax = d.negative if ( d.negative > dmax )
		dmax

	buildWaves: ( data, dmax ) ->
		positive = []
		neutral = []
		negative = []
		if dmax isnt 0
			positive = data.map( ( d, i ) ->
				if d then { x:i, y: d.positive / dmax } else { x: i, y: 0 }
			)
			neutral = data.map( ( d, i ) ->
				if d then { x:i, y: d.neutral / dmax } else { x: i, y: 0 }
			)
			negative = data.map( ( d, i ) ->
				if d then { x:i, y: d.negative / dmax } else { x: i, y: 0 }
			)
		else
			positive = data.map( ( d, i ) -> { x: i, y: 0 } )
			neutral = data.map( ( d, i ) -> { x: i, y: 0 } )
			negative = data.map( ( d, i ) -> { x: i, y: 0 } )

		[ negative, neutral, positive ]

	buildLayers: ( data, subwave = null ) ->
		dmax = @findMax( data )
		data_waves = @buildWaves( data, dmax )

		data_layers = d3.layout.stack().offset('wiggle')( data_waves )

		offset = 0

		stack = d3.layout.stack().offset('wiggle')
		if subwave?
			layers = stack( @buildWaves( subwave, dmax ) )
			smax = @findMax( subwave )
			missing = 1.0 - ( smax / dmax )
			offset = @height * ( missing / 2.0 )
		else
			layers = stack( data_waves )

		x = d3.scale.linear().domain([0, data.length]).range([0, @width])
		y = d3.scale.linear().domain([0, d3.max(
			data_layers, (layer) -> d3.max layer, (d) -> d.y0 + d.y
		)])
		.range([@height, 0])

		area = d3.svg.area()
			.x((d) => x d.x )
			.y0((d) => y d.y0 )
			.y1((d) => y d.y0 + d.y )
			.interpolate('basis')

		{
			layers: layers
			area: area
			offset: offset
		}
