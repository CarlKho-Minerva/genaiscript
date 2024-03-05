import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"

// https://astro.build/config
export default defineConfig({
    site: "https://microsoft.github.io",
    base: "/genaiscript",
    integrations: [
        starlight({
            title: "GenAIScript",
            favicon: "/genaiscript/favicon.svg",
            components: {
                Footer: "./src/components/Footer.astro",
            },
            social: {
                github: "https://github.com/microsoft/genaiscript",
            },
            editLink: {
                baseUrl:
                    "https://github.com/microsoft/genaiscript/edit/main/docs/",
            },
            sidebar: [
                {
                    label: "Start Here",
                    autogenerate: { directory: "getting-started" },
                },
                {
                    label: "Guides",
                    autogenerate: { directory: "guides" },
                },
                {
                    label: "Reference",
                    autogenerate: { directory: "reference" },
                },
            ],
        }),
    ],
})