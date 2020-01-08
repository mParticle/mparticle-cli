export const sampleDataPlan: { [key: string]: any } = {
  data_plan_id: 'test',
  data_plan_name: 'Test - yo',
  data_plan_description: 'Test',
  data_plan_versions: [
    {
      version: 1,
      data_plan_id: 'test',
      version_description: 'dev',
      activated_environment: 'development',
      created_on: '2019-11-13T17:41:08.477',
      created_by: 'fake-user@mparticle.com',
      last_modified_on: '2020-01-03T18:37:56.79',
      last_modified_by: 'some-user@mparticle.com',
      version_document: {
        data_points: [
          {
            description: '',
            match: {
              type: 'custom_event',
              criteria: {
                event_name: 'location1',
                custom_event_type: 'location'
              }
            },
            validator: {
              type: 'json_schema',
              definition: {
                properties: {
                  data: {
                    additionalProperties: true,
                    properties: {
                      custom_event_type: {
                        const: 'location'
                      },
                      event_name: {
                        const: 'location1'
                      },
                      custom_attributes: {
                        additionalProperties: false,
                        properties: {},
                        required: []
                      }
                    },
                    required: ['custom_event_type', 'event_name']
                  }
                }
              }
            }
          },
          {
            description: '',
            match: {
              type: 'custom_event',
              criteria: {
                event_name: 'f',
                custom_event_type: 'navigation'
              }
            },
            validator: {
              type: 'json_schema',
              definition: {
                properties: {
                  data: {
                    additionalProperties: true,
                    properties: {
                      custom_event_type: {
                        const: 'navigation'
                      },
                      event_name: {
                        const: 'f'
                      },
                      custom_attributes: {
                        additionalProperties: false,
                        properties: {
                          f: {
                            description: '',
                            type: 'string'
                          },
                          a: {
                            description: 'f',
                            type: 'string'
                          },
                          faaa: {
                            description: '',
                            pattern: 'fa',
                            type: 'string'
                          }
                        },
                        required: []
                      }
                    },
                    required: ['custom_event_type', 'event_name']
                  }
                }
              }
            }
          },
          {
            description: 'locaiton',
            match: {
              type: 'custom_event',
              criteria: {
                event_name: 'test',
                custom_event_type: 'location'
              }
            },
            validator: {
              type: 'json_schema',
              definition: {
                properties: {
                  data: {
                    additionalProperties: true,
                    properties: {
                      custom_event_type: {
                        const: 'location'
                      },
                      event_name: {
                        const: 'test'
                      },
                      custom_attributes: {
                        additionalProperties: false,
                        properties: {
                          one: {
                            description: "should be 'one'",
                            enum: ['one'],
                            type: 'string'
                          }
                        },
                        required: ['one']
                      }
                    },
                    required: [
                      'custom_event_type',
                      'event_name',
                      'custom_attributes'
                    ]
                  }
                }
              }
            }
          },
          {
            description: '',
            match: {
              type: 'custom_event',
              criteria: {
                event_name: 'Event 1',
                custom_event_type: 'navigation'
              }
            },
            validator: {
              type: 'json_schema',
              definition: {
                properties: {
                  data: {
                    additionalProperties: true,
                    properties: {
                      custom_event_type: {
                        const: 'navigation'
                      },
                      event_name: {
                        const: 'Event 1'
                      },
                      custom_attributes: {
                        additionalProperties: false,
                        properties: {
                          'Attr 1': {
                            description: '',
                            type: 'string'
                          },
                          'Attr 2': {
                            description: '',
                            type: 'string'
                          },
                          'Attr 3': {
                            description: '',
                            type: 'boolean'
                          },
                          'Attr 4': {
                            description: '',
                            maximum: 2,
                            minimum: 1,
                            type: 'number'
                          }
                        },
                        required: []
                      }
                    },
                    required: ['custom_event_type', 'event_name']
                  }
                }
              }
            }
          },
          {
            description: '',
            match: {
              type: 'screen_view',
              criteria: {
                screen_name: 'foo name'
              }
            },
            validator: {
              type: 'json_schema',
              definition: {
                properties: {
                  data: {
                    additionalProperties: true,
                    properties: {
                      screen_name: {
                        const: 'foo name'
                      },
                      custom_attributes: {
                        additionalProperties: false,
                        properties: {},
                        required: []
                      }
                    },
                    required: ['screen_name']
                  }
                }
              }
            }
          }
        ],
        settings: {
          validation_actions: {
            event: 'allow',
            event_attribute: 'allow',
            user_attribute: 'allow'
          }
        }
      }
    }
  ],
  created_on: '2019-11-13T17:41:08.31',
  created_by: 'fake-user@mparticle.com',
  last_modified_on: '2019-12-16T16:29:03.143',
  last_modified_by: 'other-user@mparticle.com'
};

export const sampleVersion: { [key: string]: any } =
  sampleDataPlan.data_plan_versions[0];
