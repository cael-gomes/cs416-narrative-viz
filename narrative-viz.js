/**
 * Narrative Visualization: The Education-Health Connection
 * Interactive story about sexual education, economic development, and health outcomes
 */

class NarrativeVisualization {
    constructor() {
        // State management
        this.currentScene = 1;
        this.data = null;
        this.filteredData = null;
        this.regions = [];
        this.incomeGroups = [];
        this.years = [];
        
        // Visual parameters - moderately larger chart for better visibility
        this.margin = { top: 50, right: 70, bottom: 90, left: 90 };
        this.width = 1100 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
        
        // Animation settings
        this.transitionDuration = 800;
        this.transitionEase = d3.easeQuadInOut;
        
        // Color schemes
        this.colors = {
            regions: d3.scaleOrdinal(d3.schemeSet2),
            income: d3.scaleOrdinal()
                .domain(['Low income', 'Lower middle income', 'Upper middle income', 'High income'])
                .range(['#dc2626', '#d97706', '#059669', '#2563eb']),
            hiv: d3.scaleSequential(d3.interpolateReds).domain([0, 5])
        };
        
        // Initialize
        this.initializeEventListeners();
        this.loadData();
    }
    
    async loadData() {
        try {
            console.log('Loading data...');
            // Try to load from external file first, fallback to embedded data
            try {
                this.data = await d3.json('data/processed_data.json');
            } catch (corsError) {
                console.log('CORS error detected, using embedded data...');
                // Fallback: load embedded data (will be added below)
                this.data = this.getEmbeddedData();
            }
            
            // Extract unique values for filters
            this.regions = [...new Set(this.data.map(d => d.region).filter(r => r))].sort();
            this.incomeGroups = [...new Set(this.data.map(d => d.income_group).filter(r => r))].sort();
            this.years = [...new Set(this.data.map(d => d.year))].sort((a, b) => b - a);
            
            console.log(`Data loaded: ${this.data.length} records, ${this.regions.length} regions`);
            
            // Populate filter options
            this.populateFilters();
            
            // Initialize first scene
            this.renderCurrentScene();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load data. Please check the console for details.');
        }
    }
    
    populateFilters() {
        // Populate region filters
        const regionSelects = document.querySelectorAll('[id$="region-select-1"]');
        regionSelects.forEach(select => {
            select.innerHTML = '<option value="all">All Regions</option>';
            this.regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                select.appendChild(option);
            });
        });
        
        // Set up year sliders for scenes 1 and 2 only
        const yearSliders = ['year-slider-1', 'year-slider-2'];
        const yearDisplays = ['year-display-1', 'year-display-2'];
        
        yearSliders.forEach((sliderId, index) => {
            const yearSlider = document.getElementById(sliderId);
            if (yearSlider) {
                const minYear = Math.min(...this.years);
                const maxYear = Math.max(...this.years);
                yearSlider.min = minYear;
                yearSlider.max = maxYear;
                yearSlider.value = maxYear; // Start with most recent year
                
                const displayId = yearDisplays[index];
                const display = document.getElementById(displayId);
                if (display) {
                    display.textContent = maxYear;
                }
            }
        });
        
       
    }
    
    initializeEventListeners() {
        // Navigation buttons
        document.getElementById('prev-btn').addEventListener('click', () => this.previousScene());
        document.getElementById('next-btn').addEventListener('click', () => this.nextScene());
        
        // Scene indicators
        document.querySelectorAll('.scene-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const scene = parseInt(e.target.dataset.scene);
                this.goToScene(scene);
            });
        });
        
        // Filter controls with debouncing for smooth slider animation
        let yearTimeout;
        
        // Year slider for Scene 1
        document.getElementById('year-slider-1')?.addEventListener('input', (e) => {
            document.getElementById('year-display-1').textContent = e.target.value;
            clearTimeout(yearTimeout);
            yearTimeout = setTimeout(() => this.renderCurrentScene(), 50);
        });
        
        // Year slider for Scene 2
        document.getElementById('year-slider-2')?.addEventListener('input', (e) => {
            document.getElementById('year-display-2').textContent = e.target.value;
            clearTimeout(yearTimeout);
            yearTimeout = setTimeout(() => this.renderCurrentScene(), 50);
        });
        

        
        document.getElementById('region-select-1')?.addEventListener('change', () => this.renderCurrentScene());
        document.getElementById('education-metric')?.addEventListener('change', () => this.renderCurrentScene());

        document.getElementById('success-stories')?.addEventListener('change', () => this.renderCurrentScene());
    }
    
    previousScene() {
        if (this.currentScene > 1) {
            this.goToScene(this.currentScene - 1);
        }
    }
    
    nextScene() {
        if (this.currentScene < 3) {
            this.goToScene(this.currentScene + 1);
        }
    }
    
    goToScene(sceneNumber) {
        // Hide current scene
        document.querySelector(`#scene-${this.currentScene}`).classList.add('hidden');
        
        // Update state
        this.currentScene = sceneNumber;
        
        // Show new scene
        document.querySelector(`#scene-${this.currentScene}`).classList.remove('hidden');
        
        // Update navigation state
        this.updateNavigation();
        
        // Render the scene
        this.renderCurrentScene();
    }
    
    updateNavigation() {
        // Update buttons
        document.getElementById('prev-btn').disabled = this.currentScene === 1;
        document.getElementById('next-btn').disabled = this.currentScene === 3;
        
        // Update scene indicators
        document.querySelectorAll('.scene-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index + 1 === this.currentScene);
        });
    }
    
    renderCurrentScene() {
        if (!this.data) return;
        
        switch (this.currentScene) {
            case 1:
                this.renderScene1();
                break;
            case 2:
                this.renderScene2();
                break;
            case 3:
                this.renderScene3();
                break;
        }
    }
    
    filterData(filters = {}) {
        let filtered = [...this.data];
        
        // Apply filters
        if (filters.year) {
            filtered = filtered.filter(d => d.year === parseInt(filters.year));
        }
        
        if (filters.region && filters.region !== 'all') {
            filtered = filtered.filter(d => d.region === filters.region);
        }
        
        if (filters.income && filters.income !== 'all') {
            filtered = filtered.filter(d => d.income_group === filters.income);
        }
        
        // Remove records with missing key data
        filtered = filtered.filter(d => {
            const hasBasicData = d.income_per_capita !== null || d.life_expectancy !== null;
            return hasBasicData;
        });
        
        return filtered;
    }
    
    hideLoading(sceneId) {
        const scene = document.getElementById(sceneId);
        const loading = scene.querySelector('.loading');
        const viz = scene.querySelector('.viz-svg');
        
        loading.style.display = 'none';
        viz.style.display = 'block';
    }
    
    showError(message) {
        console.error(message);
        // You could add a more sophisticated error display here
    }
    
    // Embedded data fallback for CORS issues
    getEmbeddedData() {
        // Sample dataset for demonstration when CORS blocks external file access
        return [
            {"country_name": "United States", "country_code": "USA", "year": 2021, "region": "North America", "income_group": "High income", "income_per_capita": 63593, "hiv_incidence_rate": 0.38, "adult_literacy_rate": 99, "life_expectancy": 78.86, "total_population": 331893745, "condom_use_average": 61},
            {"country_name": "Germany", "country_code": "DEU", "year": 2021, "region": "Europe & Central Asia", "income_group": "High income", "income_per_capita": 46208, "hiv_incidence_rate": 0.12, "adult_literacy_rate": 99, "life_expectancy": 81.33, "total_population": 83129285, "condom_use_average": 65},
            {"country_name": "South Africa", "country_code": "ZAF", "year": 2021, "region": "Sub-Saharan Africa", "income_group": "Upper middle income", "income_per_capita": 6374, "hiv_incidence_rate": 7.7, "adult_literacy_rate": 87, "life_expectancy": 64.13, "total_population": 59392255, "condom_use_average": 45},
            {"country_name": "Brazil", "country_code": "BRA", "year": 2021, "region": "Latin America & Caribbean", "income_group": "Upper middle income", "income_per_capita": 7507, "hiv_incidence_rate": 0.41, "adult_literacy_rate": 93, "life_expectancy": 75.88, "total_population": 213993437, "condom_use_average": 55},
            {"country_name": "India", "country_code": "IND", "year": 2021, "region": "South Asia", "income_group": "Lower middle income", "income_per_capita": 1947, "hiv_incidence_rate": 0.07, "adult_literacy_rate": 74, "life_expectancy": 69.66, "total_population": 1380004385, "condom_use_average": 32},
            {"country_name": "China", "country_code": "CHN", "year": 2021, "region": "East Asia & Pacific", "income_group": "Upper middle income", "income_per_capita": 10500, "hiv_incidence_rate": 0.03, "adult_literacy_rate": 97, "life_expectancy": 78.21, "total_population": 1412360000, "condom_use_average": 48},
            {"country_name": "Nigeria", "country_code": "NGA", "year": 2021, "region": "Sub-Saharan Africa", "income_group": "Lower middle income", "income_per_capita": 2097, "hiv_incidence_rate": 0.52, "adult_literacy_rate": 62, "life_expectancy": 54.69, "total_population": 218541212, "condom_use_average": 28},
            {"country_name": "Thailand", "country_code": "THA", "year": 2021, "region": "East Asia & Pacific", "income_group": "Upper middle income", "income_per_capita": 7189, "hiv_incidence_rate": 0.06, "adult_literacy_rate": 93, "life_expectancy": 77.15, "total_population": 69950850, "condom_use_average": 72},
            {"country_name": "Kenya", "country_code": "KEN", "year": 2021, "region": "Sub-Saharan Africa", "income_group": "Lower middle income", "income_per_capita": 1816, "hiv_incidence_rate": 1.4, "adult_literacy_rate": 82, "life_expectancy": 66.7, "total_population": 54027487, "condom_use_average": 58},
            {"country_name": "Rwanda", "country_code": "RWA", "year": 2021, "region": "Sub-Saharan Africa", "income_group": "Low income", "income_per_capita": 822, "hiv_incidence_rate": 0.26, "adult_literacy_rate": 73, "life_expectancy": 69.0, "total_population": 13276513, "condom_use_average": 54},
            
            // Add more years for some countries to show time series
            {"country_name": "United States", "country_code": "USA", "year": 2015, "region": "North America", "income_group": "High income", "income_per_capita": 56863, "hiv_incidence_rate": 0.42, "adult_literacy_rate": 99, "life_expectancy": 78.69, "total_population": 321418820, "condom_use_average": 58},
            {"country_name": "South Africa", "country_code": "ZAF", "year": 2015, "region": "Sub-Saharan Africa", "income_group": "Upper middle income", "income_per_capita": 5724, "hiv_incidence_rate": 10.2, "adult_literacy_rate": 85, "life_expectancy": 62.77, "total_population": 55386367, "condom_use_average": 42},
            {"country_name": "Thailand", "country_code": "THA", "year": 2015, "region": "East Asia & Pacific", "income_group": "Upper middle income", "income_per_capita": 5970, "hiv_incidence_rate": 0.09, "adult_literacy_rate": 93, "life_expectancy": 76.43, "total_population": 68863514, "condom_use_average": 68},
            {"country_name": "Rwanda", "country_code": "RWA", "year": 2015, "region": "Sub-Saharan Africa", "income_group": "Low income", "income_per_capita": 697, "hiv_incidence_rate": 0.35, "adult_literacy_rate": 68, "life_expectancy": 66.1, "total_population": 11917508, "condom_use_average": 48},
            
            // Add 2010 data points
            {"country_name": "United States", "country_code": "USA", "year": 2010, "region": "North America", "income_group": "High income", "income_per_capita": 48374, "hiv_incidence_rate": 0.48, "adult_literacy_rate": 99, "life_expectancy": 78.54, "total_population": 309321666, "condom_use_average": 54},
            {"country_name": "South Africa", "country_code": "ZAF", "year": 2010, "region": "Sub-Saharan Africa", "income_group": "Upper middle income", "income_per_capita": 7275, "hiv_incidence_rate": 15.1, "adult_literacy_rate": 82, "life_expectancy": 58.09, "total_population": 51216964, "condom_use_average": 38},
            {"country_name": "Thailand", "country_code": "THA", "year": 2010, "region": "East Asia & Pacific", "income_group": "Upper middle income", "income_per_capita": 5112, "hiv_incidence_rate": 0.15, "adult_literacy_rate": 92, "life_expectancy": 75.24, "total_population": 66402316, "condom_use_average": 62},
            {"country_name": "Rwanda", "country_code": "RWA", "year": 2010, "region": "Sub-Saharan Africa", "income_group": "Low income", "income_per_capita": 594, "hiv_incidence_rate": 0.68, "adult_literacy_rate": 63, "life_expectancy": 62.3, "total_population": 10412820, "condom_use_average": 35}
        ];
    }
    
            // Scene 1: Global Landscape - Income vs HIV Incidence
    renderScene1() {
        const sceneId = 'scene-1';
        const svgId = 'viz-1';
        
        this.hideLoading(sceneId);
        
        // Get filter values
        const year = document.getElementById('year-slider-1')?.value || '2021';
        const region = document.getElementById('region-select-1')?.value || 'all';
        
        // Filter data
        const data = this.filterData({ year, region });
        
        // Remove previous visualization
        d3.select(`#${svgId}`).selectAll('*').remove();
        
        const svg = d3.select(`#${svgId}`);
        const container = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
        // Filter for valid data
        const validData = data.filter(d => 
            d.income_per_capita !== null && 
            d.hiv_incidence_rate !== null && 
            d.hiv_incidence_rate >= 0
        );
        
        if (validData.length === 0) {
            container.append('text')
                .attr('x', this.width / 2)
                .attr('y', this.height / 2)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .style('fill', '#6b7280')
                .text('No data available for the selected filters');
            return;
        }
        
        // Set up scales with better domain handling
        const xExtent = d3.extent(validData, d => d.income_per_capita);
        const xScale = d3.scaleLog()
            .domain([Math.max(xExtent[0], 100), xExtent[1]]) // Avoid log(0) issues
            .range([0, this.width])
            .clamp(true);
        
        const yScale = d3.scaleSqrt()
            .domain([0, d3.max(validData, d => d.hiv_incidence_rate) * 1.1])
            .range([this.height, 0]);
        
        const rScale = d3.scaleSqrt()
            .domain(d3.extent(validData, d => d.total_population || 1000000))
            .range([3, 25]);
        
        // Add axes with better logarithmic tick distribution
        container.append('g')
            .attr('transform', `translate(0,${this.height})`)
            .call(d3.axisBottom(xScale)
                .tickValues([200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]) // Custom tick values for better spacing
                .tickFormat(d => {
                    if (d >= 10000) return `$${Math.round(d/1000)}k`;
                    if (d >= 1000) return `$${(d/1000).toFixed(1)}k`;
                    return `$${Math.round(d)}`;
                }))
            .selectAll('text')
            .style('font-size', '10px')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');
        
        // Add x-axis label
        container.append('text')
            .attr('x', this.width / 2)
            .attr('y', this.height + 55)
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .style('font-weight', '500')
            .style('font-size', '12px')
            .text('Income Per Capita (USD) - Log Scale');
        
        // Add y-axis with cleaner formatting
        container.append('g')
            .call(d3.axisLeft(yScale)
                .ticks(6)
                .tickFormat(d => d.toFixed(1)))
            .selectAll('text')
            .style('font-size', '11px');
        
        // Add y-axis label
        container.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', -this.height / 2)
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .style('font-weight', '500')
            .style('font-size', '12px')
            .text('HIV Incidence Rate (per 1,000)');
        
        // Add circles with smooth transitions
        const circles = container.selectAll('.country-circle')
            .data(validData, d => d.country_code || d.country_name);
        
        // Handle entering circles
        const circlesEnter = circles.enter()
            .append('circle')
            .attr('class', 'country-circle')
            .attr('cx', d => xScale(d.income_per_capita))
            .attr('cy', d => yScale(d.hiv_incidence_rate))
            .attr('r', 0) // Start with radius 0
            .attr('fill', d => this.colors.income(d.income_group))
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('opacity', 0)
            .style('cursor', 'pointer');
        
        // Animate entering circles
        circlesEnter.transition()
            .duration(this.transitionDuration)
            .ease(this.transitionEase)
            .delay((d, i) => i * 20) // Stagger animation
            .attr('r', d => rScale(d.total_population || 1000000))
            .attr('opacity', 0.7);
        
        // Handle updating circles
        circles.transition()
            .duration(this.transitionDuration)
            .ease(this.transitionEase)
            .attr('cx', d => xScale(d.income_per_capita))
            .attr('cy', d => yScale(d.hiv_incidence_rate))
            .attr('r', d => rScale(d.total_population || 1000000))
            .attr('fill', d => this.colors.income(d.income_group))
            .attr('opacity', 0.7);
        
        // Handle exiting circles
        circles.exit()
            .transition()
            .duration(this.transitionDuration / 2)
            .ease(this.transitionEase)
            .attr('r', 0)
            .attr('opacity', 0)
            .remove();
        
        // Merge enter and update selections for event handlers
        const allCircles = circlesEnter.merge(circles);
        
        // Add subtle grid lines for better readability
        container.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0,${this.height})`)
            .call(d3.axisBottom(xScale)
                .ticks(8)
                .tickSize(-this.height)
                .tickFormat('')
            )
            .selectAll('line')
            .style('stroke', '#e5e7eb')
            .style('stroke-dasharray', '2,2')
            .style('opacity', 0.4);
            
        container.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScale)
                .ticks(6)
                .tickSize(-this.width)
                .tickFormat('')
            )
            .selectAll('line')
            .style('stroke', '#e5e7eb')
            .style('stroke-dasharray', '2,2')
            .style('opacity', 0.4);
        
        // Add interactivity
        this.addTooltip(allCircles, d => `
            <strong>${d.country_name}</strong><br/>
            Income: $${(d.income_per_capita || 0).toLocaleString()}<br/>
            HIV Rate: ${(d.hiv_incidence_rate || 0).toFixed(2)} per 1,000<br/>
            Population: ${(d.total_population || 0).toLocaleString()}<br/>
            Income Group: ${d.income_group}
        `);
        
        // Add crosshair lines with axis values
        this.addCrosshair(allCircles, container, xScale, yScale, 'income_per_capita', 'hiv_incidence_rate');
        
        // Add legend
        this.addIncomeLegend(container, 'scene1');
        
        // Calculate when all circle animations will be complete
        const maxDelay = (validData.length - 1) * 20; // Last circle's stagger delay
        const totalAnimationTime = this.transitionDuration + maxDelay;
        
        // Add annotations after all animations are complete
        setTimeout(() => {
            this.addScene1Annotations(container, xScale, yScale, validData);
        }, totalAnimationTime + 200); // Extra 200ms buffer for smoothness
    }
    
    // Scene 2: Education Factor
    renderScene2() {
        const sceneId = 'scene-2';
        const svgId = 'viz-2';
        
        this.hideLoading(sceneId);
        
        // Get filter values
        const year = document.getElementById('year-slider-2')?.value || '2021';
        const educationMetric = document.getElementById('education-metric')?.value || 'secondary_school_enrollment';
        
        // Filter data for selected year with education data
        const data = this.data.filter(d => 
            d.year === parseInt(year) && 
            d[educationMetric] !== null && 
            d.hiv_incidence_rate !== null &&
            d.income_per_capita !== null
        );
        
        // Remove previous visualization
        d3.select(`#${svgId}`).selectAll('*').remove();
        
        if (data.length === 0) {
            const svg = d3.select(`#${svgId}`);
            svg.append('text')
                .attr('x', '50%')
                .attr('y', '50%')
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .style('fill', '#6b7280')
                .text('Limited education data available');
            return;
        }
        
        const svg = d3.select(`#${svgId}`);
        const container = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d[educationMetric]))
            .range([0, this.width]);
        
        const yScale = d3.scaleSqrt()
            .domain([0, d3.max(data, d => d.hiv_incidence_rate) * 1.1])
            .range([this.height, 0]);
        
        const rScale = d3.scaleSqrt()
            .domain(d3.extent(data, d => d.total_population || 1000000))
            .range([4, 20]);
        
        // Add axes
        const xLabel = educationMetric === 'adult_literacy_rate' ? 'Adult Literacy Rate (%)' : 'Secondary School Enrollment (%)';
        
        container.append('g')
            .attr('transform', `translate(0,${this.height})`)
            .call(d3.axisBottom(xScale))
            .append('text')
            .attr('x', this.width / 2)
            .attr('y', 40)
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .style('font-weight', '500')
            .text(xLabel);
        
        container.append('g')
            .call(d3.axisLeft(yScale)
                .ticks(8)
                .tickFormat(d => d.toFixed(1)))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -this.height / 2)
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .style('font-weight', '500')
            .text('HIV Incidence Rate (per 1,000) - Square Root Scale');
        
        // Add top and right axes for complete frame (matching Scene 1)
        container.append('g')
            .call(d3.axisTop(xScale).tickSize(0).tickFormat(''))
            .selectAll('path')
            .style('stroke', '#000');
            
        container.append('g')
            .attr('transform', `translate(${this.width},0)`)
            .call(d3.axisRight(yScale).tickSize(0).tickFormat(''))
            .selectAll('path')
            .style('stroke', '#000');
        
        // Add circles with transitions
        const circles = container.selectAll('.country-circle')
            .data(data, d => d.country_code || d.country_name);
        
        // Handle entering circles
        const circlesEnter = circles.enter()
            .append('circle')
            .attr('class', 'country-circle')
            .attr('cx', d => xScale(d[educationMetric]))
            .attr('cy', d => yScale(d.hiv_incidence_rate))
            .attr('r', 0)
            .attr('fill', d => this.colors.income(d.income_group))
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('opacity', 0)
            .style('cursor', 'pointer');
        
        // Animate entering circles
        circlesEnter.transition()
            .duration(this.transitionDuration)
            .ease(this.transitionEase)
            .delay((d, i) => i * 15)
            .attr('r', d => rScale(d.total_population || 1000000))
            .attr('opacity', 0.7);
        
        // Handle updating circles
        circles.transition()
            .duration(this.transitionDuration)
            .ease(this.transitionEase)
            .attr('cx', d => xScale(d[educationMetric]))
            .attr('cy', d => yScale(d.hiv_incidence_rate))
            .attr('r', d => rScale(d.total_population || 1000000))
            .attr('fill', d => this.colors.income(d.income_group))
            .attr('opacity', 0.7);
        
        // Handle exiting circles
        circles.exit()
            .transition()
            .duration(this.transitionDuration / 2)
            .ease(this.transitionEase)
            .attr('r', 0)
            .attr('opacity', 0)
            .remove();
        
        const allCircles = circlesEnter.merge(circles);
        
        // Add trend line
        this.addTrendLine(container, data, educationMetric, 'hiv_incidence_rate', xScale, yScale);
        
        // Add interactivity
        this.addTooltip(allCircles, d => `
            <strong>${d.country_name}</strong><br/>
            ${xLabel}: ${(d[educationMetric] || 0).toFixed(1)}%<br/>
            HIV Rate: ${(d.hiv_incidence_rate || 0).toFixed(2)} per 1,000<br/>
            Population: ${(d.total_population || 0).toLocaleString()}<br/>
            Income: $${(d.income_per_capita || 0).toLocaleString()}<br/>
            Region: ${d.region}
        `);
        
        // Add crosshair lines with axis values
        this.addCrosshair(allCircles, container, xScale, yScale, educationMetric, 'hiv_incidence_rate');
        
        // Add income legend for consistency across scenes
        this.addIncomeLegend(container, 'scene2');
    }
    
    // Scene 3: Behavioral Impact
    renderScene3() {
        const sceneId = 'scene-3';
        const svgId = 'viz-3';
        
        this.hideLoading(sceneId);
        

        
        // Filter data for condom use data - aggregate across 2010+ for better coverage
        let filteredData = this.data.filter(d => 
            d.condom_use_average !== null && 
            d.adult_literacy_rate !== null &&
            d.year >= 2010 // Focus on decade with better data availability
        );
        

        
        const data = filteredData;
        
        // Remove previous visualization
        d3.select(`#${svgId}`).selectAll('*').remove();
        
        if (data.length === 0) {
            const svg = d3.select(`#${svgId}`);
            svg.append('text')
                .attr('x', '50%')
                .attr('y', '50%')
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .style('fill', '#6b7280')
                .text('Limited behavioral data available');
            return;
        }
        
        const svg = d3.select(`#${svgId}`);
        const container = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.adult_literacy_rate))
            .range([0, this.width]);
        
        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.condom_use_average))
            .range([this.height, 0]);
        
        const rScale = d3.scaleSqrt()
            .domain(d3.extent(data, d => d.total_population || 1000000))
            .range([4, 20]);
        
        // Add axes
        container.append('g')
            .attr('transform', `translate(0,${this.height})`)
            .call(d3.axisBottom(xScale))
            .append('text')
            .attr('x', this.width / 2)
            .attr('y', 40)
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .style('font-weight', '500')
            .text('Adult Literacy Rate (%)');
        
        container.append('g')
            .call(d3.axisLeft(yScale))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -this.height / 2)
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .style('font-weight', '500')
            .text('Condom Use Rate (%)');
        
        // Add top and right axes for complete frame (matching Scene 1)
        container.append('g')
            .call(d3.axisTop(xScale).tickSize(0).tickFormat(''))
            .selectAll('path')
            .style('stroke', '#000');
            
        container.append('g')
            .attr('transform', `translate(${this.width},0)`)
            .call(d3.axisRight(yScale).tickSize(0).tickFormat(''))
            .selectAll('path')
            .style('stroke', '#000');
        
        // Add circles with transitions
        const circles = container.selectAll('.country-circle')
            .data(data, d => `${d.country_code || d.country_name}_${d.year}`);
        
        // Handle entering circles
        const circlesEnter = circles.enter()
            .append('circle')
            .attr('class', 'country-circle')
            .attr('cx', d => xScale(d.adult_literacy_rate))
            .attr('cy', d => yScale(d.condom_use_average))
            .attr('r', 0)
            .attr('fill', d => this.colors.income(d.income_group))
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('opacity', 0)
            .style('cursor', 'pointer');
        
        // Animate entering circles
        circlesEnter.transition()
            .duration(this.transitionDuration)
            .ease(this.transitionEase)
            .delay((d, i) => i * 10)
            .attr('r', d => rScale(d.total_population || 1000000))
            .attr('opacity', 0.7);
        
        // Handle updating circles
        circles.transition()
            .duration(this.transitionDuration)
            .ease(this.transitionEase)
            .attr('cx', d => xScale(d.adult_literacy_rate))
            .attr('cy', d => yScale(d.condom_use_average))
            .attr('r', d => rScale(d.total_population || 1000000))
            .attr('fill', d => this.colors.income(d.income_group))
            .attr('opacity', 0.7);
        
        // Handle exiting circles
        circles.exit()
            .transition()
            .duration(this.transitionDuration / 2)
            .ease(this.transitionEase)
            .attr('r', 0)
            .attr('opacity', 0)
            .remove();
        
        const allCircles = circlesEnter.merge(circles);
        
        // Add trend line
        this.addTrendLine(container, data, 'adult_literacy_rate', 'condom_use_average', xScale, yScale);
        
        // Add interactivity
        this.addTooltip(allCircles, d => `
            <strong>${d.country_name}</strong><br/>
            Literacy Rate: ${(d.adult_literacy_rate || 0).toFixed(1)}%<br/>
            Condom Use: ${(d.condom_use_average || 0).toFixed(1)}%<br/>
            Population: ${(d.total_population || 0).toLocaleString()}<br/>
            Income Group: ${d.income_group}<br/>
            Year: ${d.year}
        `);
        
        // Add crosshair lines with axis values
        this.addCrosshair(allCircles, container, xScale, yScale, 'adult_literacy_rate', 'condom_use_average');
        
        // Add income legend
        this.addIncomeLegend(container, 'scene3');
    }
    
    // Utility functions
    showLoading(sceneId) {
        const scene = document.getElementById(sceneId);
        const loading = scene.querySelector('.loading');
        const svg = scene.querySelector('.viz-svg');
        
        if (loading) loading.style.display = 'flex';
        if (svg) svg.style.display = 'none';
    }
    
    hideLoading(sceneId) {
        const scene = document.getElementById(sceneId);
        const loading = scene.querySelector('.loading');
        const svg = scene.querySelector('.viz-svg');
        
        if (loading) loading.style.display = 'none';
        if (svg) svg.style.display = 'block';
    }
    
    addTooltip(selection, contentFn) {
        const tooltip = d3.select('#tooltip');
        
        selection
            .on('mouseover', function(event, d) {
                tooltip
                    .style('opacity', 1)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px')
                    .html(contentFn(d));
            })
            .on('mousemove', function(event) {
                tooltip
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', function() {
                tooltip.style('opacity', 0);
            });
    }
    
    addCrosshair(selection, container, xScale, yScale, xField, yField) {
        const height = this.height; // Capture height in closure
        
        selection
            .on('mouseover.crosshair', function(event, d) {
                const x = xScale(d[xField]);
                const y = yScale(d[yField]);
                const xValue = d[xField];
                const yValue = d[yField];
                
                // Remove any existing crosshair elements
                container.selectAll('.crosshair-line, .crosshair-text').remove();
                
                // Add horizontal line from point to y-axis
                container.append('line')
                    .attr('class', 'crosshair-line')
                    .attr('x1', 0)
                    .attr('y1', y)
                    .attr('x2', x)
                    .attr('y2', y)
                    .attr('stroke', '#dc2626')
                    .attr('stroke-width', 1)
                    .attr('stroke-dasharray', '4,4')
                    .attr('opacity', 0.8);
                
                // Add vertical line from point to x-axis
                container.append('line')
                    .attr('class', 'crosshair-line')
                    .attr('x1', x)
                    .attr('y1', y)
                    .attr('x2', x)
                    .attr('y2', height)
                    .attr('stroke', '#dc2626')
                    .attr('stroke-width', 1)
                    .attr('stroke-dasharray', '4,4')
                    .attr('opacity', 0.8);
                
                // Add x-value text on x-axis
                const xText = xField === 'income_per_capita' ? 
                    (xValue >= 10000 ? `$${Math.round(xValue/1000)}k` : 
                     xValue >= 1000 ? `$${(xValue/1000).toFixed(1)}k` : 
                     `$${Math.round(xValue)}`) :
                    `${xValue.toFixed(1)}%`;
                
                container.append('text')
                    .attr('class', 'crosshair-text')
                    .attr('x', x)
                    .attr('y', height + 15)
                    .attr('text-anchor', 'middle')
                    .style('fill', '#dc2626')
                    .style('font-weight', 'bold')
                    .style('font-size', '11px')
                    .text(xText);
                
                // Add y-value text on y-axis  
                const yText = yField === 'hiv_incidence_rate' ? 
                    yValue.toFixed(1) : 
                    yValue.toFixed(1);
                
                container.append('text')
                    .attr('class', 'crosshair-text')
                    .attr('x', -8)
                    .attr('y', y + 3)
                    .attr('text-anchor', 'end')
                    .style('fill', '#dc2626')
                    .style('font-weight', 'bold')
                    .style('font-size', '11px')
                    .text(yText);
            })
            .on('mouseout.crosshair', function() {
                // Remove crosshair lines and text
                container.selectAll('.crosshair-line, .crosshair-text').remove();
            });
    }
    
    
    addTrendLine(container, data, xField, yField, xScale, yScale) {
        // Simple linear regression
        const validData = data.filter(d => d[xField] !== null && d[yField] !== null);
        if (validData.length < 3) return;
        
        const xMean = d3.mean(validData, d => d[xField]);
        const yMean = d3.mean(validData, d => d[yField]);
        
        let numerator = 0;
        let denominator = 0;
        
        validData.forEach(d => {
            const xDiff = d[xField] - xMean;
            const yDiff = d[yField] - yMean;
            numerator += xDiff * yDiff;
            denominator += xDiff * xDiff;
        });
        
        const slope = numerator / denominator;
        const intercept = yMean - slope * xMean;
        
        // Create line points - use many points to properly show curve on transformed scale
        const xExtent = d3.extent(validData, d => d[xField]);
        const lineData = [];
        const numPoints = 50; // Create 50 points for smooth curve
        
        for (let i = 0; i <= numPoints; i++) {
            const x = xExtent[0] + (xExtent[1] - xExtent[0]) * (i / numPoints);
            const y = slope * x + intercept;
            lineData.push({ x: x, y: y });
        }
        
        // Create path generator for smooth curve
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveLinear);
        
        // Add trend line as path (handles scale transformation properly)
        container.append('path')
            .datum(lineData)
            .attr('d', line)
            .attr('stroke', '#dc2626')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
            .attr('fill', 'none')
            .attr('opacity', 0.7);
    }
    
    addIncomeLegend(container, scene) {
        const legend = container.append('g');
        if (scene === 'scene1') {
            legend.attr('transform', `translate(${this.width - 150}, 20)`);
        } else if (scene === 'scene3') {
            legend.attr('transform', `translate(10, 20)`);
        } else {
            legend.attr('transform', `translate(${this.width - 150}, 20)`);
        }
        
        legend.append('rect')
            .attr('width', 145)
            .attr('height', 100)
            .attr('fill', 'white')
            .attr('stroke', '#e5e7eb')
            .attr('rx', 4);
        
        const incomeGroups = [
            { name: 'High income', color: '#0ea5e9' },
            { name: 'Upper middle income', color: '#059669'},
            { name: 'Lower middle income', color: '#f59e0b' },
            { name: 'Low income', color: '#dc2626' }
        ];
        
        incomeGroups.forEach((group, i) => {
            legend.append('circle')
                .attr('cx', 15)
                .attr('cy', 20 + i * 18)
                .attr('r', 4)
                .attr('fill', group.color);
            
            legend.append('text')
                .attr('x', 25)
                .attr('y', 24 + i * 18)
                .style('font-size', '11px')
                .text(group.name.length > 20 ? group.name.substring(0, 17) + '...' : group.name);
        });
    }
    
    addScene1Annotations(container, xScale, yScale, data) {
        // First annotation: Upper middle income with high HIV
        const upperMiddleIncomeHighHIV = data.filter(d => 
            d.income_group === 'Upper middle income' && d.hiv_incidence_rate > 1.0
        );
        
        const southAfrica = data.find(d => 
            d.country_name === 'South Africa' && d.hiv_incidence_rate !== null
        );
        
        const upperMiddleIncomeModerateHIV = data.filter(d => 
            d.income_group === 'Upper middle income' && d.hiv_incidence_rate > 0.5
        );
        
        // Draw dotted rectangle around upper middle income countries with high HIV
        if (upperMiddleIncomeHighHIV.length > 0) {
            // Calculate bounding box for upper middle income + high HIV countries
            const xValues = upperMiddleIncomeHighHIV.map(d => xScale(d.income_per_capita));
            const yValues = upperMiddleIncomeHighHIV.map(d => yScale(d.hiv_incidence_rate));
            
            const minX = Math.min(...xValues) - 30;
            const maxX = Math.max(...xValues) + 30;
            const minY = Math.min(...yValues) - 20;
            const maxY = Math.max(...yValues) + 20;
            
            // Add dotted rectangle
            container.append('rect')
                .attr('x', minX)
                .attr('y', minY)
                .attr('width', maxX - minX)
                .attr('height', maxY - minY)
                .attr('fill', 'none')
                .attr('stroke', '#059669')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '8,4')
                .attr('opacity', 0.7)
                .attr('rx', 5); // Rounded corners
        }
        
        // Prioritize South Africa if it exists and has notable HIV rate
        if (southAfrica && southAfrica.hiv_incidence_rate > 1.0) {
            // First line of text
            container.append('text')
                .attr('x', xScale(southAfrica.income_per_capita) + 20)
                .attr('y', yScale(southAfrica.hiv_incidence_rate))
                .style('font-size', '11px')
                .style('font-weight', '500')
                .style('fill', 'black')
                .text('Upper middle income does not');
            // Second line of text
            container.append('text')
                .attr('x', xScale(southAfrica.income_per_capita) + 20)
                .attr('y', yScale(southAfrica.hiv_incidence_rate) +10)
                .style('font-size', '11px')
                .style('font-weight', '500')
                .style('fill', 'black')
                .text('guarantee low HIV incidence');
        } else if (upperMiddleIncomeHighHIV.length > 0) {
            const example = upperMiddleIncomeHighHIV.sort((a, b) => b.hiv_incidence_rate - a.hiv_incidence_rate)[0];
            // First line of text
            container.append('text')
                .attr('x', xScale(example.income_per_capita) + 20)
                .attr('y', yScale(example.hiv_incidence_rate) - 20)
                .style('font-size', '11px')
                .style('font-weight', '500')
                .style('fill', 'black')
                .text('Upper middle income does not');
            // Second line of text
            container.append('text')
                .attr('x', xScale(example.income_per_capita) + 20)
                .attr('y', yScale(example.hiv_incidence_rate) - 5)
                .style('font-size', '11px')
                .style('font-weight', '500')
                .style('fill', 'black')
                .text('guarantee low HIV incidence');
        } else if (upperMiddleIncomeModerateHIV.length > 0) {
            const example = upperMiddleIncomeModerateHIV.sort((a, b) => b.hiv_incidence_rate - a.hiv_incidence_rate)[0];
            container.append('text')
                .attr('x', xScale(example.income_per_capita) + 20)
                .attr('y', yScale(example.hiv_incidence_rate) - 10)
                .style('font-size', '11px')
                .style('font-weight', '500')
                .style('fill', 'black')
                .text('Income level alone doesn\'t predict health outcomes');
        }
        
        // Second annotation: Low income with low HIV (opposite perspective)
        const afghanistan = data.find(d => 
            d.country_name === 'Afghanistan' && d.hiv_incidence_rate !== null
        );
        
        const lowIncomeLowHIV = data.filter(d => 
            d.income_group === 'Low income' && d.hiv_incidence_rate < 0.2
        );
        
        // Draw dotted rectangle around low income countries with low HIV
        if (lowIncomeLowHIV.length > 0) {
            // Calculate bounding box for low income + low HIV countries
            const xValues = lowIncomeLowHIV.map(d => xScale(d.income_per_capita));
            const yValues = lowIncomeLowHIV.map(d => yScale(d.hiv_incidence_rate));
            
            const minX = Math.min(...xValues) - 30;
            const maxX = Math.max(...xValues) + 30;
            const minY = Math.min(...yValues) - 20;
            const maxY = Math.max(...yValues) + 20;
            
            // Add dotted rectangle
            container.append('rect')
                .attr('x', minX)
                .attr('y', minY)
                .attr('width', maxX - minX)
                .attr('height', maxY - minY)
                .attr('fill', 'none')
                .attr('stroke', '#dc2626')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '8,4')
                .attr('opacity', 0.7)
                .attr('rx', 5); // Rounded corners
        }
        
        // Target Afghanistan specifically, or any low income country with very low HIV
        if (afghanistan && afghanistan.hiv_incidence_rate < 0.5) {
            container.append('text')
                .attr('x', xScale(afghanistan.income_per_capita) -150)
                .attr('y', yScale(afghanistan.hiv_incidence_rate) + 15)  // Position below the point
                .style('font-size', '11px')
                .style('font-weight', '500')
                .style('fill', 'black')
                .text('Low income doesn\'t necessarily mean high HIV incidence');
        } else if (lowIncomeLowHIV.length > 0) {
            const example = lowIncomeLowHIV.sort((a, b) => a.hiv_incidence_rate - b.hiv_incidence_rate)[0];
            container.append('text')
                .attr('x', xScale(example.income_per_capita) -150)
                .attr('y', yScale(example.hiv_incidence_rate) + 15)  // Position below the point
                .style('font-size', '11px')
                .style('font-weight', '500')
                .style('fill', 'black')
                .text('Low income doesn\'t necessarily mean high HIV incidence');
        }
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NarrativeVisualization();
});