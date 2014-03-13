class SlotMap
	constructor: ( totalSlots ) ->
		@totalSlots = Math.floor( totalSlots )
		@slots = []
		@slots.push( null ) for sl in [ 0 ... @totalSlots - 1 ]

	add: ( slot, name ) ->
		slot = @totalSlots - 1 if slot > @totalSlots - 1
		if @slots[ slot ]?
			for slot in [ slot ... @totalSlots - 1 ]
				break unless @slots[ slot ]
		if slot is @totalSlots - 1 and @slots[ slot ]?
			@crunch()
		@slots[ slot ] = name

	crunch: () ->
		for slot in [ @totalSlots - 1 ... 0 ]
			unless @slots[ slot ]?
				@slots.splice( slot, 1 )
				break

	get: ( name ) ->
		ind = 0
		for slot, ind in @slots
			return ind if slot == name
			ind += 1
		0

simplifyNumber = ( number ) ->
	postfix = ''
	if ( Math.abs( number ) > 1000000000 )
		number = number / 1000000000
		postfix = 'B'
	if ( Math.abs( number ) > 1000000 )
		number = number / 1000000
		postfix = 'M'
	if ( Math.abs( number ) > 1000 )
		number = number / 1000
		postfix = 'K'
	val = Math.floor( number * 100.0 ) / 100.0
	"#{val}#{postfix}"

class window.ElegantWaves
	constructor: ( @parent, @data, @options = {} ) ->
		unless @options.margin?
			@options.margin =
				top: 20
				right: 250
				bottom: 30
				left: 0
		@options.width = 600 unless @options.width?
		@options.height = 200 unless @options.height?

		svg = d3
			.select( @parent )
			.append( 'svg' )
			.attr( 'class', 'elegant-waves')
			.attr( 'width', @options.width + @options.margin.left + @options.margin.right )
			.attr( 'height', @options.height + @options.margin.top + @options.margin.bottom )
			.append( 'g' )
			.attr 'transform', "translate(#{@options.margin.left},#{@options.margin.top})"

		max_date = new Date()
		min_date = new Date()

		min_vector_date = new Date()
		min_vector_date.setMonth( max_date.getMonth() - 13 );

		for k in d3.keys @data
			for d in @data[k]
				min_date = d.date if d.date < min_date

		dr_start_in_ms = min_date
		if @options.daterange
			dr = @options.daterange + 30
			dr_start_in_ms = max_date - ( dr * 24 * 60 * 60 * 1000 )

		x = d3.time
			.scale()
			.range [0, @options.width]

		xAxis = d3.svg
			.axis()
			.ticks(5)
			.scale(x)
			.orient('bottom')

		x.domain [ dr_start_in_ms, max_date ]

		hs = null
		he = null
		if @options.hilightstart?.length > 0
			hs = @options.hilightstart
			hs = @options.hilightstart unless hs?
			he = max_date
			if @options.hilightend?.length > 0
				he = @options.hilightend
				he = @options.hilightend unless he?

		svg
			.append( 'g' )
			.attr( 'class', 'x axis' )
			.attr( 'transform', "translate(0,#{@options.height})" )
			.call xAxis

		color = d3.scale.category10()
		color.domain d3.keys @data

		yBoxSize = 15
		yBoxUsed = {}
		totalBoxes = @options.height / yBoxSize
		sm = new SlotMap totalBoxes + 1

		yscale = {}
		for k in d3.keys @data
			vector = @data[k].filter((el) -> return el.date >= min_vector_date)
			yscale[k] = d3.scale.linear().range [@options.height - 3, 4]
			yscale[k].domain d3.extent( vector, (v) -> v.value )

		ordered = d3.keys @data
		ordered = ordered.sort (a,b) =>
			av = yscale[a] @data[a][ @data[a].length - 1 ].value
			bv = yscale[b] @data[b][ @data[b].length - 1 ].value
			av > bv

		if he != null && hs != null
			svg
				.append( 'rect' )
				.attr( 'x', x( hs ) )
				.attr( 'width', x( he ) - x( hs ) )
				.attr( 'y', 0 )
				.attr( 'height', @options.height )
				.style( {
					fill: 'black'
					'fill-opacity': '0.2'
				} )

		svg
			.append( 'text')
			.attr( 'transform', "translate(#{x(max_date)+190},0)" )
			.attr( 'x', 3 )
			.attr( 'y', -10 )
			.style( 'fill', 'black' )
			.style( 'font-weight', 'bold' )
			.text "Max"
		svg
			.append( 'text')
			.attr( 'transform', "translate(#{x(max_date)+130},0)" )
			.attr( 'x', 3 )
			.attr( 'y', -10 )
			.style( 'fill', 'black' )
			.style( 'font-weight', 'bold' )
			.text "Min"

		for k in ordered
			vector = @data[k]
			yBox = Math.floor yscale[k]( vector[ vector.length - 1 ].value ) / yBoxSize
			sm.add yBox, k

		yOverlapRange = 11
		bisectDate = d3.bisector((d) -> d.date).left

		data = @data
		mousemove = ->
			for k of focus
				y = yscale[k]
				mmVector = data[k]
				x0 = x.invert(d3.mouse(@)[0])
				i = bisectDate(mmVector, x0, 1)
				d0 = mmVector[i - 1]
				d1 = mmVector[i]
				if d1 == undefined
					d1 = mmVector[i - 1]
				if x0 - d0.date > d1.date - x0
					d = d1
				else d = d0

				# Prevent overlaping and off-graph values
				yOffset = 0
				tempYOffset = null
				stepDown = false
				yTopMargin = 6
				calcYOffset = =>
					tempYOffset = yOffset
					for n,val of yMap
						break if n == k
						while (true)
							yDiff = Math.abs(val - (y(d.value) + yOffset))
							if (y(d.value) + yOffset) < yTopMargin
								stepDown = true
							if yDiff < yOverlapRange && stepDown == true
							 	yOffset = yOffset + (yOverlapRange - yDiff)
							else if yDiff < yOverlapRange
								yOffset = yOffset - (yOverlapRange - yDiff)
							else break

				calcYOffset()
				while tempYOffset != yOffset
					calcYOffset()

				yMap[k] = (y(d.value) + yOffset)

				# Prevent overlap with Signal text description
				if (new Date( d.date )).getTime() == max_date.getTime()
					xOffset = (d.value.toString().length * -5.9) - 7
				else xOffset = 9

				focus[k].attr 'transform', 'translate(' + x(d.date) + ',' + (y(d.value) + yOffset) + ')'
				focus[k].select('text')
					.attr('x', xOffset)
					.text d.value

		mouseover = =>
			for k of focus
				focus[k].style 'display', null

		mouseout = =>
			for k of focus
				focus[k].style 'display', 'none'

		focus = {}
		yMap = {}
		yOffset = {}
		for k in ordered
			vector = @data[k]
			y = yscale[k]

			if @options.autoscale
				orig_vector = vector
				vector = []
				for pt in orig_vector
					if x( pt.date ) >= 0
						vector.push( pt )

			line = d3.svg
				.line()
				.interpolate( 'monotone' )
				.x( (d) -> x d.date )
				.y( (d) -> y d.value )

			svg
				.append( 'path' )
				.datum(vector)
				.attr( 'class', 'line' )
				.style( 'fill','none' )
				.attr( 'd', line )
				.style( 'stroke', (d) -> color k )
				.style( 'stroke-width', 1 )

			yBox = sm.get(k) * yBoxSize

			svg
				.append('text')
				.datum((d) ->
					name: k
					value: vector[vector.length - 1]
				)
				.attr('transform', (d) ->
					"translate(#{x(max_date)},#{yBox})"
				)
				.attr( 'x', 3 )
				.attr( 'dy', '.35em' )
				.style( 'fill', (d) -> color k )
				.text "#{k}"

			focus[k] = svg.append('g').attr('class', 'focus').style('display', 'none')

			focus[k].append('circle')
				.attr( 'r', 3.5 )
				.style( 'stroke', (d) -> color k )
				.style( 'fill', 'none')

			focus[k].append('text')
				.attr('x', 9)
				.attr('y', 0)
				.attr 'dy', '.35em'

			svg.append('rect')
				.attr('width', @options.width)
				.attr('height', @options.height)
				.style( {
					'fill': 'none'
					'pointer-events': 'all'
				} )
				.on('mouseover', mouseover)
				.on('mouseout', mouseout)
				.on 'mousemove', mousemove

			filtered_vector = vector.filter((el) -> return el.date >= min_vector_date)
			min = Math.floor d3.min( filtered_vector, ( d ) -> d.value )
			max = Math.floor d3.max( filtered_vector, ( d ) -> d.value )

			min_text = simplifyNumber min
			max_text = simplifyNumber max

			svg
				.append( 'text' )
				.datum( (d) ->
					name: k
					value: vector[vector.length - 1]
				)
				.attr( 'transform', (d) ->
					"translate(#{x(max_date)+130},#{yBox})"
				)
				.attr( 'x', 3 )
				.attr( 'dy', '.35em' )
				.style( 'fill', (d) -> color k )
				.style( 'font-weight', if k is 'overall_chi_score' then 'bold' else '' )
				.text min_text

			svg
				.append( 'text' )
				.datum( (d) ->
					name: k
					value: vector[vector.length - 1]
				)
				.attr( 'transform', (d) ->
					"translate(#{x(max_date)+190},#{yBox})"
				)
				.attr( 'x', 3 )
				.attr( 'dy', '.35em' )
				.style( 'fill', (d) -> color k )
				.style( 'font-weight', if k is 'overall_chi_score' then 'bold' else '' )
				.text max_text

		if @options.events?
			for c in @options.events
				xval = x c.date
				if c.date <= max_date and xval >= 0
					svg
						.append( 'line' )
						.datum( c )
						.attr( 'x1', x c.date )
						.attr( 'x2', x c.date )
						.attr( 'y1', 0 )
						.attr( 'y2', @options.height )
						.attr(
							'data-original-title': "#{c.date}: #{c.subject}"
							'data-placement': 'bottom'
							'data-toggle': 'tooltip'
							'data-container': 'body'
							'class': 'line-tooltip'
						)
						.style(
							'stroke': if c.priority is 1 then 'red' else 'orange'
							'stroke-width': '4'
							'stroke-opacity': '0.5'
						)
						.on 'click', ( d ) =>
							@options.click( d ) if @options.click?
							$rootScope.$apply()
