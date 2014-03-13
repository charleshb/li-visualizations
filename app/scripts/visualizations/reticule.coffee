class ReticuleLabels
	constructor: ( @parent, @data, @width, @height, @radius, @start, @end, @color, @key ) ->
		@svg = @parent
			.append('g')
			.attr('transform', "translate(#{width / 2},#{height / 2})")
			.style(
				'pointer-events': 'none'
			)

		@sticks = []
		@balls = []
		@texts = []

		ratio = ( Math.PI * 2 ) / 360
		start = ( Math.PI / 2 ) * 3
		inset = ( Math.PI * 2 ) * ( 1 / 720 )
		for d,i in @data
			mtotal = d.size * ratio
			sa = start + inset + ( mtotal / 2 )

			x1 = Math.cos( sa ) * ( radius * 0.3 )
			x2 = Math.cos( sa ) * ( radius * 1.3 )
			y1 = Math.sin( sa ) * ( radius * 0.3 )
			y2 = Math.sin( sa ) * ( radius * 1.3 )

			@sticks[ d.id ] = @svg
				.append( 'svg:line')
				.attr(
					x1: x1
					y1: y1
					x2: x2
					y2: y2
				)
				.style(
					stroke: 'black'
					'stroke-width': 0.3
					'pointer-events': 'none'
				)

			@balls[ d.id ] = @svg
				.append( 'svg:ellipse')
				.attr(
					cx: x2
					cy: y2
					rx: 3
					ry: 3
				)
				.style(
					fill: 'black'
					'pointer-events': 'none'
				)

			tx = x2 - 5
			tx = x2 - 13 if ( x2 < 0 )
			@texts[ d.id ] = @svg
				.append( 'svg:text')
				.attr(
					x: tx
					y: y2 + 4
					dx: '0.8em'
					'text-anchor': if x2 < 0 then 'end' else 'start'
					'data-id': d.id
				)
				.style(
					fill: 'black'
				)
				.text( d.label )

			start += mtotal

		for d,i in @data
			enabled = false
			if ( d.positive > 0 or d.negative > 0 or d.neutral > 0 )
 				enabled = true
			color = if enabled then 'black' else '#cccccc'
			@sticks[ d.id ].style('stroke',color)
			@balls[ d.id ].style('fill',color)
			@texts[ d.id ].style('fill',color)

class InnerRing
	constructor: ( @parent, @data, @width, @height, @radius, @start, @end, @color, @key ) ->
		@innerRadius = @radius - @end
		arc = d3.svg.arc()
			.outerRadius(@radius - @start)
			.innerRadius(@innerRadius)

		@svg = @parent
			.append('g')
			.attr('transform', "translate(#{width / 2},#{height / 2})")
			.style(
				'pointer-events': 'none'
			)

		pie = @build_pie()

		g = @svg
			.selectAll('.arc')
			.data( pie )
			.enter()
			.append('g')
			.attr('class', 'arc')
			.style(
				'pointer-events': 'none'
			)

		g
			.append( 'path' )
			.style(
				'fill': @color
				'pointer-events': 'none'
			)
			.attr( 'd', arc )

	build_pie: () ->
		pie = []
		ratio = ( Math.PI * 2 ) / 360
		start = 0
		inset = ( Math.PI * 2 ) * ( 1 / 720 )
		for d,i in @data
			mtotal = d.size * ratio
			sa = start + inset
			ea = ( start + mtotal ) - inset
			if @key?
				ctotal = ( d[@key] / d.max ) * mtotal
				sa = ( start + ( ( mtotal / 2 ) - ( ctotal / 2 ) ) ) + inset
				ea = ( start + ( ( mtotal / 2 ) + ( ctotal / 2 ) ) ) - inset
			sa = ea if ( ea < sa )
			pie.push(
				index: i
				startAngle: sa
				endAngle: ea
				value: d[@key]
				data: d
				innerRadius: @innerRadius
			)
			start += mtotal
		pie

class window.Reticule
	constructor: ( @parent, @height, @data ) ->
		@width = @height * 1.6
		@diameter = @height * 0.5

		@svg = d3.select( @parent )
			.append('svg')
			.attr('width', @width)
			.attr('height', @height)

		rw = @diameter * 0.08
		ri = @diameter * 0.01

		start = ri + ri
		rings = []
		for i in [0..2]
			rings.push(
				start: start
				end: start + rw
			)
			start += rw + ri

		radius = @diameter / 2

		new InnerRing( @svg, @data, @width, @height, radius, 0, start, 'rgba(128,128,128,0.3)', null )

		@p = new InnerRing( @svg, @data, @width, @height, radius, rings[0].start, rings[0].end, 'green', 'positive' )
		@o = new InnerRing( @svg, @data, @width, @height, radius, rings[1].start, rings[1].end, '#999999', 'neutral' )
		@n = new InnerRing( @svg, @data, @width, @height, radius, rings[2].start, rings[2].end, 'red', 'negative' )

		@labels = new ReticuleLabels( @svg, @data, @width, @height, radius )
