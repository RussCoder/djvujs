import { defineConfig } from 'cypress'

export default defineConfig({
    viewportWidth: 1200,
    viewportHeight: 900,
    video: false,
    fixturesFolder: false,
    e2e: {
        setupNodeEvents(on, config) {},
        baseUrl: 'http://localhost:8000/?tests=1',
        supportFile: false,
    },
})
