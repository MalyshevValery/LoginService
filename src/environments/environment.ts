// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // kratos_public: 'https://apibioimage.hopto.org/kratos'
  kratos_public: 'http://127.0.0.1/kratos',
  url_mapping: {
    github: 'http://127.0.0.1/kratos/self-service/methods/oidc/callback/github'
  },
}
