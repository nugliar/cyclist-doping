import * as d3 from "https://cdn.skypack.dev/d3@7";

document.addEventListener('DOMContentLoaded', () => {
  const request = new XMLHttpRequest()
  const url = './json/cyclist-data.json'

  request.onload = () => {
    const response = JSON.parse(request.response)
    const dataset = response

    const w = 1000
    const h = 500
    const paddingX = {
      left: 80,
      right: 20
    }
    const paddingY = {
      top: 20,
      bottom: 20
    }

    const parseRaceTime = d3.timeParse('%M:%S')
    const parseRaceYear = d3.timeParse('%Y')
    const padMs = 6 * 30 * 24 * 60 * 1000

    const yDomain = d3.extent(dataset, d => parseRaceTime(d['Time']))
    const xDomain = d3.extent(dataset, d => parseRaceYear(d['Year']))

    xDomain[0] = new Date(xDomain[0].valueOf() - padMs)
    yDomain.reverse()

    const xScale = d3.scaleTime()
      .domain(xDomain)
      .range([paddingX.left, w - paddingX.right])
      .nice(d3.timeYear.every(1))

    const yScale = d3.scaleTime()
      .domain(yDomain)
      .range([h - paddingY.bottom, paddingY.top])
      .nice()

    const svg = d3.select('.outer-container')
      .append('svg')
      .attr('width', w)
      .attr('height', h)
      .style('border', 'none')

    const xAxis = d3.axisBottom(xScale)

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(t => {
        return d3.timeFormat('%M:%S')(t)
      })

    const tooltip = d3.select('.outer-container')
      .append('div')
      .attr('id', 'tooltip')
      .attr('class', 'tooltip')
      .style('opacity', 0)

    svg.selectAll('circle')
      .data(dataset)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('data-xvalue', d => parseRaceYear(d['Year']))
      .attr('data-yvalue', d => parseRaceTime(d['Time']))
      .attr('cx', d => xScale(parseRaceYear(d['Year'])))
      .attr('cy', d => yScale(parseRaceTime(d['Time'])))
      .attr('r', 6)
      .attr('fill', d => {
        return d['Doping'] ? '#e38671' : '#49d19b'
      })
      .on('mouseover', (e, d) => {
        const racer = d['Name'] + ': ' + d['Nationality'] + '<br>'
        const result = `Year: ${d['Year']}, Time: ${d['Time']}`
        const doping = d['Doping'] ? '<br>' + d['Doping'] : ''
        const info = racer + result + doping

        e.preventDefault()

        tooltip.transition()
          .duration(100)
          .style('opacity', 0.9)
        tooltip.html(info)
          .attr('data-year', e.target.attributes['data-xvalue'].value)
          .style("left", (d3.pointer(e)[0] + 35) + "px")
          .style("top", (d3.pointer(e)[1] + 60) + "px")
      })
      .on('mouseout', (e, d) => {
        tooltip.transition()
          .duration(100)
          .style('opacity', 0)
      })

      const SAMPLE = {
        "Time": "36:50",
        "Place": 1,
        "Seconds": 2210,
        "Name": "Marco Pantani",
        "Year": 1995,
        "Nationality": "ITA",
        "Doping": "Alleged drug use during 1995 due to high hematocrit levels",
        "URL": "https://en.wikipedia.org/wiki/Marco_Pantani#Alleged_drug_use"
      }
    svg.append('g')
      .attr('transform', 'translate(0, ' + (h - paddingY.bottom) + ')')
      .attr('id', 'x-axis')
      .call(xAxis)

    svg.append('g')
      .attr('transform', 'translate(' + paddingX.left + ', 0)')
      .attr('id', 'y-axis')
      .call(yAxis)
      .append('text')
        .attr('text-anchor', 'middle')
        .attr('class', 'yAxis-label')
        .attr('x', -(h / 2))
        .attr('y', -60)
        .attr('dy', '0.75em')
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'black')
        .text('Race time ( mins )')

    const legendLabels = [
      'No doping allegations',
      'Racers with doping allegations'
    ]

    const legendColors = [
      '#49d19b',
      '#e38671'
    ]

    const legend = svg.append('g')
      .attr('id', 'legend')
      .attr('transform', 'translate(' + (w * 0.95) + ',' + (h * 0.4) + ')')
      .selectAll('g')
      .data(legendLabels)
      .enter()
      .append('g')
        .attr('id', 'legend-label')
        .attr('transform', (d, i) => {
          return 'translate(0, ' + (i * 20) + ')'
        })

    legend.append('text')
      .attr('text-anchor', 'end')
      .attr('font-size', '0.6em')
      .text(d => d)

    legend.append('rect')
        .attr('width', 14)
        .attr('height', 14)
        .attr('y', -10)
        .attr('x', 5)
        .attr('fill', (d, i) => legendColors[i])

  }
  request.open('GET', url, true)
  request.send()
})
