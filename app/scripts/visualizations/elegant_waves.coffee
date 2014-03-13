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

class window.ElegantWaves
	simplifyNumber: ( number ) ->
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

	createFocus: () ->
		@focus = {}
		@yMap = {}

		yOverlapRange = 11
		bisectDate = d3.bisector((d) -> d.date).left

		self = @
		@mousemove = ->
			for k of self.focus
				y = self.yscale[k]
				mmVector = self.data[k]
				x0 = self.x.invert(d3.mouse(@)[0])
				i = bisectDate(mmVector, x0, 1)
				d0 = mmVector[i - 1]
				d1 = mmVector[i]
				d1 = mmVector[i - 1] if d1 == undefined
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
					for n,val of self.yMap
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

				self.yMap[k] = (y(d.value) + yOffset)

				# Prevent overlap with Signal text description
				if (new Date( d.date )).getTime() == self.max_date.getTime()
					xOffset = (d.value.toString().length * -5.9) - 7
				else xOffset = 9

				self.focus[k].attr 'transform', 'translate(' + self.x(d.date) + ',' + (y(d.value) + yOffset) + ')'

				self.focus[k].select('text')
					.attr('x', xOffset)

				self.updateFocus( k, d )

		@mouseover = =>
			for k of @focus
				@focus[k].style 'display', null

		@mouseout = =>
			for k of @focus
				@focus[k].style 'display', 'none'

	updateFocus: ( signal, data ) ->
		@focus[signal].select('text').text( @formatFocusNumber( data.value ) )

	formatFocusNumber: ( value ) ->
		Math.round( value * 100.0 ) / 100.0

	drawFocus: ( signal ) ->
		@focus[signal].append('circle')
			.attr( 'r', 3.5 )
			.style( 'stroke', (d) => @color signal )
			.style( 'fill', 'none')

		@focus[signal].append('text')
			.attr('x', 9)
			.attr('y', 0)
			.attr 'dy', '.35em'

	createFocusFor: ( signal ) ->
		@focus[signal] = @svg.append('g').attr('class', 'focus').style('display', 'none')

		@drawFocus( signal )

		@svg.append('rect')
			.attr('width', @options.width)
			.attr('height', @options.height)
			.style( {
				'fill': 'none'
				'pointer-events': 'all'
			} )
			.on('mouseover', @mouseover)
			.on('mouseout', @mouseout)
			.on 'mousemove', @mousemove

	drawMinMax: () ->
		@svg
			.append( 'text')
			.attr( 'transform', "translate(#{@x(@max_date)+190},0)" )
			.attr( 'x', 3 )
			.attr( 'y', -10 )
			.style( 'fill', 'black' )
			.style( 'font-weight', 'bold' )
			.text @options.text.max

		@svg
			.append( 'text')
			.attr( 'transform', "translate(#{@x(@max_date)+130},0)" )
			.attr( 'x', 3 )
			.attr( 'y', -10 )
			.style( 'fill', 'black' )
			.style( 'font-weight', 'bold' )
			.text @options.text.min

	setupOptions: () ->
		unless @options.margin?
			@options.margin =
				top: 20
				right: 250
				bottom: 30
				left: 0
		@options.width = 600 unless @options.width?
		@options.height = 200 unless @options.height?
		@options.text = {} unless @options.text?
		@options.text.min = 'Min' unless @options.text.min?
		@options.text.max = 'Max' unless @options.text.max?

	createContainer: () ->
		@svg = d3
			.select( @parent )
			.append( 'svg' )
			.attr( 'class', 'elegant-waves')
			.attr( 'width', @options.width + @options.margin.left + @options.margin.right )
			.attr( 'height', @options.height + @options.margin.top + @options.margin.bottom )
			.append( 'g' )
			.attr 'transform', "translate(#{@options.margin.left},#{@options.margin.top})"

	drawXAxis: () ->
		xAxis = d3.svg
			.axis()
			.ticks(5)
			.scale(@x)
			.orient('bottom')
		@svg
			.append( 'g' )
			.attr( 'class', 'x axis' )
			.attr( 'transform', "translate(0,#{@options.height})" )
			.call xAxis

	drawHilight: () ->
		if @options.hilightstart? > 0
			@svg
				.append( 'rect' )
				.attr( 'x', @x( @options.hilightstart ) )
				.attr( 'width', @x( @options.hilightend ) - @x( @options.hilightstart ) )
				.attr( 'y', 0 )
				.attr( 'height', @options.height )
				.style( {
					fill: 'black'
					'fill-opacity': '0.2'
				} )

	createXAxis: () ->
		@determineMinMaxDates()
		@x = d3.time.scale().range [0, @options.width]
		@x.domain [ @min_date, @max_date ]

	createYScales: () ->
		@yscale = {}
		for k in d3.keys @data
			@yscale[k] = d3.scale.linear().range [@options.height - 3, 4]
			@yscale[k].domain d3.extent( @data[k], (v) -> v.value )

	eventStyle: ( event ) ->
		{
			'stroke': if event.priority is 1 then 'red' else 'orange'
			'stroke-width': '4'
			'stroke-opacity': '0.5'
		}

	eventAttributes: ( event ) ->
		{
			'data-original-title': "#{event.date}: #{event.subject}"
			'data-placement': 'bottom'
			'data-toggle': 'tooltip'
			'data-container': 'body'
			'class': 'line-tooltip'
		}

	eventClick: ( event ) ->

	renderEvent: ( event, x ) ->
		@svg
			.append( 'line' )
			.datum( event )
			.attr( 'x1', x )
			.attr( 'x2', x )
			.attr( 'y1', 0 )
			.attr( 'y2', @options.height )
			.attr( @eventAttributes( event ) )
			.style( @eventStyle( event ) )
			.on 'click', ( d ) =>
				@eventClick( d )

	drawEvents: () ->
		if @options.events?
			for c in @options.events
				xval = @x c.date
				if c.date <= @max_date and xval >= 0
					@renderEvent( c, @x( c.date ) )

	createOrdering: () ->
		@ordered = d3.keys @data
		@ordered = @ordered.sort (a,b) =>
			av = @yscale[a] @data[a][ @data[a].length - 1 ].value
			bv = @yscale[b] @data[b][ @data[b].length - 1 ].value
			av > bv

	createColoring: () ->
		@color = d3.scale.category10()
		@color.domain d3.keys @data

	determineMinMaxDates: () ->
		@max_date = new Date()
		@min_date = new Date()

		for k in d3.keys @data
			for d in @data[k]
				@min_date = d.date if d.date < @min_date

		if @options.daterange
			dr = @options.daterange + 30
			@min_date = @max_date - ( dr * 24 * 60 * 60 * 1000 )

	drawMinMaxNumbers: ( signal, yBox ) ->
		vector = @data[ signal ]
		min = Math.floor d3.min( vector, ( d ) -> d.value )
		max = Math.floor d3.max( vector, ( d ) -> d.value )

		@svg
			.append( 'text' )
			.datum( (d) ->
				name: signal
				value: vector[vector.length - 1]
			)
			.attr( 'transform', (d) =>
				"translate(#{@x(@max_date)+130},#{yBox})"
			)
			.attr( 'x', 3 )
			.attr( 'dy', '.35em' )
			.style( 'fill', (d) => @color signal )
			.text @simplifyNumber( min )

		@svg
			.append( 'text' )
			.datum( (d) ->
				name: signal
				value: vector[vector.length - 1]
			)
			.attr( 'transform', (d) =>
				"translate(#{@x(@max_date)+190},#{yBox})"
			)
			.attr( 'x', 3 )
			.attr( 'dy', '.35em' )
			.style( 'fill', (d) => @color signal )
			.text @simplifyNumber( max )

	drawVector: ( signal ) ->
		vector = @data[ signal ]
		y = @yscale[ signal ]
		line = d3.svg
			.line()
			.interpolate( 'monotone' )
			.x( (d) => @x d.date )
			.y( (d) -> y d.value )

		@svg
			.append( 'path' )
			.datum( vector )
			.attr( 'class', 'line' )
			.style( 'fill','none' )
			.attr( 'd', line )
			.style( 'stroke', (d) => @color signal )
			.style( 'stroke-width', 1 )

	createSlotMap: () ->
		@yBoxSize = 15
		@slotMap = new SlotMap ( @options.height / @yBoxSize ) + 1
		for k in @ordered
			vector = @data[k]
			yBox = Math.floor @yscale[k]( vector[ vector.length - 1 ].value ) / @yBoxSize
			@slotMap.add yBox, k

	drawSignalText: ( signal, yBox ) ->
		vector = @data[ signal ]
		@svg
			.append('text')
			.datum((d) ->
				name: signal
				value: vector[vector.length - 1]
			)
			.attr('transform', (d) =>
				"translate(#{@x(@max_date)},#{yBox})"
			)
			.attr( 'x', 3 )
			.attr( 'dy', '.35em' )
			.style( 'fill', (d) => @color signal )
			.text "#{signal}"

	drawSignals: () ->
		for signal in @ordered
			@drawVector( signal )
			yBox = @slotMap.get( signal ) * @yBoxSize
			@createFocusFor( signal )
			@drawSignalText( signal, yBox )
			@drawMinMaxNumbers( signal, yBox )

	constructor: ( @parent, @data, @options = {} ) ->
		@setupOptions()

		@createContainer()
		@createXAxis()
		@createYScales()
		@createOrdering()
		@createColoring()
		@createSlotMap()
		@createFocus()

		@drawXAxis()
		@drawHilight()
		@drawMinMax()
		@drawSignals()
		@drawEvents()
