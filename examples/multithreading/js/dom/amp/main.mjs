var WORKER_DOM_DEBUG = /log|development/i.test(location.hash);
/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var OffscreenCanvasProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  var allowedExecution = config.executorsAllowed.includes(8
  /* OFFSCREEN_CANVAS_INSTANCE */
  );
  return {
    execute(mutations, startPosition) {
      if (allowedExecution) {
        var targetIndex = mutations[startPosition + 1
        /* Target */
        ];
        var target = nodeContext.getNode(targetIndex);

        if (target) {
          var offscreen = target.transferControlToOffscreen();
          workerContext.messageToWorker({
            [12
            /* type */
            ]: 9
            /* OFFSCREEN_CANVAS_INSTANCE */
            ,
            [13
            /* target */
            ]: [target._index_],
            [38
            /* data */
            ]: offscreen
          }, [offscreen]);
        } else {
          console.error("'OFFSCREEN_CANVAS_INSTANCE': getNode(" + targetIndex + ") is null.");
        }
      }

      return startPosition + 2
      /* End */
      ;
    },

    print(mutations, startPosition, target) {
      return {
        type: 'OFFSCREEN_CANVAS_INSTANCE',
        target,
        allowedExecution
      };
    }

  };
};

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var DefaultAllowedMutations = [0
/* ATTRIBUTES */
, 1
/* CHARACTER_DATA */
, 2
/* CHILD_LIST */
, 3
/* PROPERTIES */
, 4
/* EVENT_SUBSCRIPTION */
, 5
/* GET_BOUNDING_CLIENT_RECT */
, 6
/* LONG_TASK_START */
, 7
/* LONG_TASK_END */
, 8
/* OFFSCREEN_CANVAS_INSTANCE */
, 9
/* OBJECT_MUTATION */
, 10
/* OBJECT_CREATION */
, 11
/* IMAGE_BITMAP_INSTANCE */
, 12
/* STORAGE */
];
var ReadableMutationType = {
  0: 'ATTRIBUTES',
  1: 'CHARACTER_DATA',
  2: 'CHILD_LIST',
  3: 'PROPERTIES',
  4: 'EVENT_SUBSCRIPTION',
  5: 'GET_BOUNDING_CLIENT_RECT',
  6: 'LONG_TASK_START',
  7: 'LONG_TASK_END',
  8: 'OFFSCREEN_CANVAS_INSTANCE',
  9: 'OBJECT_MUTATION',
  10: 'OBJECT_CREATION',
  11: 'IMAGE_BITMAP_INSTANCE',
  12: 'STORAGE'
};

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var EVENT_SUBSCRIPTION_LENGTH = 2;

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Monitoring Nodes attribute changes requires a Mutation Observer.
 * We store the nodes being monitored to avoid creating more than one Observer
 * per Element.
 */

var monitoredNodes = new Map();
/**
 * Instead of a whitelist of elements that need their value tracked, use the existence
 * of a property called value to drive the decision.
 * @param node node to check if values should be tracked.
 * @return boolean if the node should have its value property tracked.
 */

var shouldTrackChanges = node => node && 'value' in node;
/**
 * When a node that has a value needing synced doesn't already have an event listener
 * listening for input values, ensure the value is synced with a default listener.
 * @param worker whom to dispatch value toward.
 * @param node node to listen to value changes on.
 */


var applyDefaultInputListener = (workerContext, node) => {
  shouldTrackChanges(node) && node.oninput === null && (node.oninput = () => fireValueChange(workerContext, node));
};
/**
 * Use a MutationObserver to capture value changes based on Attribute modification (frequently used by frameworks).
 * @param worker whom to dispatch value toward.
 * @param node node to listen to value changes on.
 */

var sendValueChangeOnAttributeMutation = (workerContext, node) => {
  if (shouldTrackChanges(node) && !monitoredNodes.get(node)) {
    new MutationObserver(mutations => mutations.map(mutation => fireValueChange(workerContext, mutation.target))).observe(node, {
      attributes: true
    });
    monitoredNodes.set(node, true);
  }
};
/**
 * Tell WorkerDOM what the value is for a Node.
 * @param worker whom to dispatch value toward.
 * @param node where to get the value from.
 */

var fireValueChange = (workerContext, node) => workerContext.messageToWorker({
  [12
  /* type */
  ]: 4
  /* SYNC */
  ,
  [40
  /* sync */
  ]: {
    [7
    /* index */
    ]: node._index_,
    [21
    /* value */
    ]: node.value
  }
});
/**
 * Tell WorkerDOM what the window dimensions are.
 * @param workerContext
 * @param cachedWindowSize
 */


var fireResizeChange = (workerContext, cachedWindowSize) => workerContext.messageToWorker({
  [12
  /* type */
  ]: 5
  /* RESIZE */
  ,
  [40
  /* sync */
  ]: cachedWindowSize
});
/**
 * Convert a TouchList into a TransferrableTouchList
 * @param touchList
 */


var createTransferrableTouchList = touchList => Object.values(touchList).map(touch => [touch.identifier, touch.screenX, touch.screenY, touch.clientX, touch.clientY, touch.pageX, touch.pageY, touch.target._index_]);

var EventSubscriptionProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  var knownListeners = [];
  var allowedExecution = config.executorsAllowed.includes(4
  /* EVENT_SUBSCRIPTION */
  );
  var cachedWindowSize = [window.innerWidth, window.innerHeight];
  /**
   * Register an event handler for dispatching events to worker thread
   * @param worker whom to dispatch events toward
   * @param index node index the event comes from (used to dispatchEvent in worker thread).
   * @return eventHandler function consuming event and dispatching to worker thread
   */

  var eventHandler = index => event => {
    if (shouldTrackChanges(event.currentTarget)) {
      fireValueChange(workerContext, event.currentTarget);
    } else if (event.type === 'resize') {
      var {
        innerWidth,
        innerHeight
      } = window;

      if (cachedWindowSize[0] === innerWidth && cachedWindowSize[1] === innerHeight) {
        return;
      }

      cachedWindowSize = [window.innerWidth, window.innerHeight];
      fireResizeChange(workerContext, cachedWindowSize);
    }

    workerContext.messageToWorker({
      [12
      /* type */
      ]: 1
      /* EVENT */
      ,
      [39
      /* event */
      ]: {
        [7
        /* index */
        ]: index,
        [25
        /* bubbles */
        ]: event.bubbles,
        [26
        /* cancelable */
        ]: event.cancelable,
        [27
        /* cancelBubble */
        ]: event.cancelBubble,
        [28
        /* currentTarget */
        ]: [event.currentTarget._index_ || 0],
        [29
        /* defaultPrevented */
        ]: event.defaultPrevented,
        [30
        /* eventPhase */
        ]: event.eventPhase,
        [31
        /* isTrusted */
        ]: event.isTrusted,
        [32
        /* returnValue */
        ]: event.returnValue,
        [13
        /* target */
        ]: [event.target._index_ || 0],
        [33
        /* timeStamp */
        ]: event.timeStamp,
        [12
        /* type */
        ]: event.type,
        [35
        /* keyCode */
        ]: 'keyCode' in event ? event.keyCode : undefined,
        [60
        /* pageX */
        ]: 'pageX' in event ? event.pageX : undefined,
        [61
        /* pageY */
        ]: 'pageY' in event ? event.pageY : undefined,
        [65
        /* offsetX */
        ]: 'offsetX' in event ? event.offsetX : undefined,
        [66
        /* offsetY */
        ]: 'offsetY' in event ? event.offsetY : undefined,
        [62
        /* touches */
        ]: 'touches' in event ? createTransferrableTouchList(event.touches) : undefined,
        [63
        /* changedTouches */
        ]: 'changedTouches' in event ? createTransferrableTouchList(event.changedTouches) : undefined
      }
    });
  };
  /**
   * If the worker requests to add an event listener to 'change' for something the foreground thread is already listening to,
   * ensure that only a single 'change' event is attached to prevent sending values multiple times.
   * @param target node to change listeners on
   * @param addEvent is this an 'addEvent' or 'removeEvent' change
   * @param type event type requested to change
   * @param index number in the listeners array this event corresponds to.
   */


  var processListenerChange = (target, addEvent, type, index) => {
    if (target === nodeContext.baseElement) {
      addEvent ? addEventListener(type, knownListeners[index] = eventHandler(1)) : removeEventListener(type, knownListeners[index]);
      return;
    }

    var inputEventSubscribed = target.oninput !== null;
    var isChangeEvent = type === 'change';

    if (addEvent) {
      if (isChangeEvent) {
        inputEventSubscribed = true;
        target.onchange = null;
      }

      target.addEventListener(type, knownListeners[index] = eventHandler(target._index_));
    } else {
      if (isChangeEvent) {
        inputEventSubscribed = false;
      }

      target.removeEventListener(type, knownListeners[index]);
    }

    if (shouldTrackChanges(target)) {
      if (!inputEventSubscribed) applyDefaultInputListener(workerContext, target);
      sendValueChangeOnAttributeMutation(workerContext, target);
    }
  };

  return {
    execute(mutations, startPosition) {
      var addEventListenerCount = mutations[startPosition + 3
      /* AddEventListenerCount */
      ];
      var removeEventListenerCount = mutations[startPosition + 2
      /* RemoveEventListenerCount */
      ];
      var addEventListenersPosition = startPosition + 4
      /* Events */
      + removeEventListenerCount * EVENT_SUBSCRIPTION_LENGTH;
      var endPosition = startPosition + 4
      /* Events */
      + (addEventListenerCount + removeEventListenerCount) * EVENT_SUBSCRIPTION_LENGTH;

      if (allowedExecution) {
        var targetIndex = mutations[startPosition + 1
        /* Target */
        ];
        var target = nodeContext.getNode(targetIndex);

        if (target) {
          for (var iterator = startPosition + 4
          /* Events */
          ; iterator < endPosition; iterator += EVENT_SUBSCRIPTION_LENGTH) {
            processListenerChange(target, iterator <= addEventListenersPosition, strings.get(mutations[iterator]), mutations[iterator + 1]);
          }
        } else {
          console.error("getNode(" + targetIndex + ") is null.");
        }
      }

      return endPosition;
    },

    print(mutations, startPosition, target) {
      var addEventListenerCount = mutations[startPosition + 3
      /* AddEventListenerCount */
      ];
      var removeEventListenerCount = mutations[startPosition + 2
      /* RemoveEventListenerCount */
      ];
      var addEventListenersPosition = startPosition + 4
      /* Events */
      + removeEventListenerCount * EVENT_SUBSCRIPTION_LENGTH;
      var endPosition = startPosition + 4
      /* Events */
      + (addEventListenerCount + removeEventListenerCount) * EVENT_SUBSCRIPTION_LENGTH;
      var removedEventListeners = [];
      var addedEventListeners = [];

      for (var iterator = startPosition + 4
      /* Events */
      ; iterator < endPosition; iterator += EVENT_SUBSCRIPTION_LENGTH) {
        var eventList = iterator <= addEventListenersPosition ? addedEventListeners : removedEventListeners;
        eventList.push({
          type: strings.get(mutations[iterator]),
          index: mutations[iterator + 1]
        });
      }

      return {
        target,
        allowedExecution,
        removedEventListeners,
        addedEventListeners
      };
    }

  };
};

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var BoundingClientRectProcessor = (strings, nodes, workerContext, objectContext, config) => {
  var allowedExecution = config.executorsAllowed.includes(5
  /* GET_BOUNDING_CLIENT_RECT */
  );
  return {
    execute(mutations, startPosition) {
      if (allowedExecution) {
        var targetIndex = mutations[startPosition + 1
        /* Target */
        ];
        var target = nodes.getNode(targetIndex);

        if (target) {
          var boundingRect = target.getBoundingClientRect();
          workerContext.messageToWorker({
            [12
            /* type */
            ]: 6
            /* GET_BOUNDING_CLIENT_RECT */
            ,
            [13
            /* target */
            ]: [target._index_],
            [38
            /* data */
            ]: [boundingRect.top, boundingRect.right, boundingRect.bottom, boundingRect.left, boundingRect.width, boundingRect.height]
          });
        } else {
          console.error("GET_BOUNDING_CLIENT_RECT: getNode(" + targetIndex + ") is null.");
        }
      }

      return startPosition + 2
      /* End */
      ;
    },

    print(mutations, startPosition) {
      var targetIndex = mutations[startPosition + 1
      /* Target */
      ];
      var target = nodes.getNode(targetIndex);
      return {
        type: 'GET_BOUNDING_CLIENT_RECT',
        target,
        allowedExecution
      };
    }

  };
};

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ChildListProcessor = (strings, _ref, workerContext, objectContext, config) => {
  var {
    getNode
  } = _ref;
  var allowedExecution = config.executorsAllowed.includes(2
  /* CHILD_LIST */
  );
  return {
    execute(mutations, startPosition) {
      var appendNodeCount = mutations[startPosition + 4
      /* AppendedNodeCount */
      ];
      var removeNodeCount = mutations[startPosition + 5
      /* RemovedNodeCount */
      ];

      if (allowedExecution) {
        var targetIndex = mutations[startPosition + 1
        /* Target */
        ];
        var target = getNode(targetIndex);

        if (target) {
          if (removeNodeCount > 0) {
            mutations.slice(startPosition + 6
            /* Nodes */
            + appendNodeCount, startPosition + 6
            /* Nodes */
            + appendNodeCount + removeNodeCount).forEach(removeId => {
              var node = getNode(removeId);

              if (node) {
                node.remove();
              } else {
                console.error("CHILD_LIST: getNode(" + removeId + ") is null.");
              }
            });
          }

          if (appendNodeCount > 0) {
            mutations.slice(startPosition + 6
            /* Nodes */
            , startPosition + 6
            /* Nodes */
            + appendNodeCount).forEach(addId => {
              var nextSibling = mutations[startPosition + 2
              /* NextSibling */
              ];
              var newNode = getNode(addId);

              if (newNode) {
                // TODO: Handle this case ---
                // Transferred nodes that are not stored were previously removed by the sanitizer.
                target.insertBefore(newNode, nextSibling && getNode(nextSibling) || null);
                applyDefaultInputListener(workerContext, newNode);
                sendValueChangeOnAttributeMutation(workerContext, newNode);
              }
            });
          }
        } else {
          console.error("CHILD_LIST: getNode(" + targetIndex + ") is null.");
        }
      }

      return startPosition + 6
      /* End */
      + appendNodeCount + removeNodeCount;
    },

    print(mutations, startPosition) {
      var targetIndex = mutations[startPosition + 1
      /* Target */
      ];
      var target = getNode(targetIndex);
      var appendNodeCount = mutations[startPosition + 4
      /* AppendedNodeCount */
      ];
      var removeNodeCount = mutations[startPosition + 5
      /* RemovedNodeCount */
      ];
      var removedNodes = Array.from(mutations.slice(startPosition + 6
      /* Nodes */
      + appendNodeCount, startPosition + 6
      /* Nodes */
      + appendNodeCount + removeNodeCount)).map(index => getNode(index) || index);
      var addedNodes = Array.from(mutations.slice(startPosition + 6
      /* Nodes */
      , startPosition + 6
      /* Nodes */
      + appendNodeCount)).map(index => getNode(index) || index);
      return {
        target,
        allowedExecution,
        nextSibling: getNode(mutations[startPosition + 2
        /* NextSibling */
        ]) || null,
        previousSibling: getNode(mutations[startPosition + 3
        /* PreviousSibling */
        ]) || null,
        addedNodes,
        removedNodes
      };
    }

  };
};

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var AttributeProcessor = (strings, nodes, workerContext, objectContext, config) => {
  var allowedExecution = config.executorsAllowed.includes(0
  /* ATTRIBUTES */
  );
  /**
   * @param mutations
   * @param startPosition
   */

  var getValue = (mutations, startPosition) => {
    var value = mutations[startPosition + 4
    /* Value */
    ]; // Value is sent as 0 when it's the default value or removal.
    // Value is sent as index + 1 when it's a valid value.

    return value !== 0 ? strings.get(value - 1) : null;
  };

  return {
    execute(mutations, startPosition) {
      if (allowedExecution) {
        var targetIndex = mutations[startPosition + 1
        /* Target */
        ];
        var target = nodes.getNode(targetIndex);
        var attributeName = strings.get(mutations[startPosition + 2
        /* Name */
        ]);
        var value = getValue(mutations, startPosition);

        if (target) {
          if (attributeName != null) {
            if (config.sanitizer) {
              var mutated = config.sanitizer.setAttribute(target, attributeName, value);
            } else {
              if (value == null) {
                target.removeAttribute(attributeName);
              } else {
                target.setAttribute(attributeName, value);
              }
            }
          }
        } else {
          console.error("ATTR_LIST: getNode(" + targetIndex + ") is null.");
        }
      }

      return startPosition + 5
      /* End */
      ;
    },

    print(mutations, startPosition) {
      var targetIndex = mutations[startPosition + 1
      /* Target */
      ];
      var target = nodes.getNode(targetIndex);
      var attributeName = strings.get(mutations[startPosition + 2
      /* Name */
      ]);
      var value = getValue(mutations, startPosition);
      return {
        target,
        allowedExecution,
        attributeName,
        value,
        remove: value == null
      };
    }

  };
};

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var CharacterDataProcessor = (strings, nodes, workerContext, objectContext, config) => {
  var allowedExecution = config.executorsAllowed.includes(1
  /* CHARACTER_DATA */
  );
  return {
    execute(mutations, startPosition) {
      if (allowedExecution) {
        var targetIndex = mutations[startPosition + 1
        /* Target */
        ];
        var target = nodes.getNode(targetIndex);
        var value = mutations[startPosition + 2
        /* Value */
        ];

        if (target) {
          if (value) {
            // Sanitization not necessary for textContent.
            target.textContent = strings.get(value);
          }
        } else {
          console.error("CHAR_DATA: getNode(" + targetIndex + ") is null.");
        }
      }

      return startPosition + 3
      /* End */
      ;
    },

    print(mutations, startPosition) {
      var targetIndex = mutations[startPosition + 1
      /* Target */
      ];
      var target = nodes.getNode(targetIndex);
      return {
        target,
        allowedExecution,
        value: strings.get(mutations[startPosition + 2
        /* Value */
        ])
      };
    }

  };
};

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var PropertyProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  var allowedExecution = config.executorsAllowed.includes(3
  /* PROPERTIES */
  );

  var getValue = (mutations, startPosition) => {
    var value = mutations[startPosition + 4
    /* Value */
    ];

    if (mutations[startPosition + 3
    /* IsBoolean */
    ] === 1
    /* TRUE */
    ) {
        return value === 1
        /* TRUE */
        ;
      }

    if (value !== 0) {
      return strings.get(value);
    }

    return null;
  };

  return {
    execute(mutations, startPosition) {
      if (allowedExecution) {
        var targetIndex = mutations[startPosition + 1
        /* Target */
        ];
        var target = nodeContext.getNode(targetIndex);
        var name = strings.get(mutations[startPosition + 2
        /* Name */
        ]);
        var value = getValue(mutations, startPosition);

        if (target) {
          if (name && value != null) {
            if (config.sanitizer) {
              var mutated = config.sanitizer.setProperty(target, name, String(value));
            } else {
              target[name] = value;
            }
          }
        } else {
          console.error("PROPERTY: getNode(" + targetIndex + ") is null.");
        }
      }

      return startPosition + 5
      /* End */
      ;
    },

    print(mutations, startPosition) {
      var targetIndex = mutations[startPosition + 1
      /* Target */
      ];
      var target = nodeContext.getNode(targetIndex);
      var name = strings.get(mutations[startPosition + 2
      /* Name */
      ]);
      var value = getValue(mutations, startPosition);
      return {
        target,
        name,
        value,
        allowedExecution
      };
    }

  };
};

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var LongTaskExecutor = (stringContext, nodeContext, workerContext, objectContext, config) => {
  var allowedExecution = config.executorsAllowed.includes(6
  /* LONG_TASK_START */
  );
  var index = 0;
  var currentResolver;
  return {
    execute(mutations, startPosition) {
      if (allowedExecution && config.longTask) {
        if (mutations[startPosition] === 6
        /* LONG_TASK_START */
        ) {
            index++;

            if (!currentResolver) {
              config.longTask(new Promise(resolve => currentResolver = resolve));
            }
          } else if (mutations[startPosition] === 7
        /* LONG_TASK_END */
        ) {
            index--;

            if (currentResolver && index <= 0) {
              currentResolver();
              currentResolver = null;
              index = 0;
            }
          }
      }

      return startPosition + 2
      /* End */
      ;
    },

    print(mutations, startPosition) {
      return {
        type: ReadableMutationType[mutations[startPosition]],
        allowedExecution
      };
    },

    get active() {
      return currentResolver !== null;
    }

  };
};

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var f32 = new Float32Array(1);
var u16 = new Uint16Array(f32.buffer);
/**
 * Deserializes TransferrableObjectType arguments.
 * @param buffer Contains mutation with arguments to deserialize.
 * @param offset Start position of arguments in mutations buffer.
 * @param count Number of arguments to deserialize.
 * @param stringContext Strings context.
 * @param nodeContext Nodes context.
 * @param objectContext Objects context
 */

function deserializeTransferrableObject(buffer, offset, count, stringContext, nodeContext, objectContext) {
  var args = [];

  for (var i = 0; i < count; i++) {
    switch (buffer[offset++]) {
      case 1
      /* SmallInt */
      :
        args.push(buffer[offset++]);
        break;

      case 2
      /* Float */
      :
        u16[0] = buffer[offset++];
        u16[1] = buffer[offset++];
        args.push(f32[0]);
        break;

      case 3
      /* String */
      :
        args.push(stringContext.get(buffer[offset++]));
        break;

      case 4
      /* Array */
      :
        var size = buffer[offset++];
        var des = deserializeTransferrableObject(buffer, offset, size, stringContext, nodeContext, objectContext);
        args.push(des.args);
        offset = des.offset;
        break;

      case 5
      /* TransferObject */
      :
        if (!objectContext) {
          throw new Error('objectContext not provided.');
        }

        args.push(objectContext.get(buffer[offset++]));
        break;

      case 6
      /* CanvasRenderingContext2D */
      :
        var canvas = nodeContext.getNode(buffer[offset++]);
        args.push(canvas.getContext('2d'));
        break;

      case 7
      /* HTMLElement */
      :
        args.push(nodeContext.getNode(buffer[offset++]));
        break;

      default:
        throw new Error('Cannot deserialize argument.');
    }
  }

  return {
    args,
    offset
  };
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ObjectMutationProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  var allowedExecution = config.executorsAllowed.includes(9
  /* OBJECT_MUTATION */
  );
  return {
    execute(mutations, startPosition) {
      var functionName = strings.get(mutations[startPosition + 1
      /* FunctionName */
      ]);
      var argCount = mutations[startPosition + 2
      /* ArgumentCount */
      ];
      var {
        offset: targetOffset,
        args: deserializedTarget
      } = deserializeTransferrableObject(mutations, startPosition + 3
      /* SerializedTarget */
      , 1, strings, nodeContext, objectContext);
      var target = deserializedTarget[0];
      var {
        offset: argsOffset,
        args
      } = deserializeTransferrableObject(mutations, targetOffset, argCount, strings, nodeContext, objectContext);

      if (allowedExecution) {
        if (isSetter(target, functionName)) {
          target[functionName] = args[0];
        } else {
          target[functionName](...args);
        }
      }

      return argsOffset;
    },

    print(mutations, startPosition) {
      var functionName = strings.get(mutations[startPosition + 1
      /* FunctionName */
      ]);
      var {
        args: deserializedTarget
      } = deserializeTransferrableObject(mutations, startPosition + 3
      /* SerializedTarget */
      , 1, strings, nodeContext, objectContext);
      var target = deserializedTarget[0];
      return {
        type: 'OBJECT_MUTATION',
        target,
        functionName,
        isSetter: isSetter(target, functionName),
        allowedExecution
      };
    }

  };
};

function isSetter(object, name) {
  if (!object) {
    throw new Error("Property " + name + " does not exist on " + object + ".");
  }

  var descriptor = Object.getOwnPropertyDescriptor(object, name);

  if (descriptor !== undefined) {
    return 'set' in descriptor;
  }

  return isSetter(Object.getPrototypeOf(object), name);
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ObjectCreationProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  var allowedExecution = config.executorsAllowed.includes(10
  /* OBJECT_CREATION */
  );

  if (!objectContext) {
    throw new Error('objectContext is not defined.');
  }

  return {
    execute(mutations, startPosition) {
      var functionName = strings.get(mutations[startPosition + 1
      /* FunctionName */
      ]);
      var objectId = mutations[startPosition + 2
      /* ObjectId */
      ];
      var argCount = mutations[startPosition + 3
      /* ArgumentCount */
      ];
      var {
        offset: targetOffset,
        args: deserializedTarget
      } = deserializeTransferrableObject(mutations, startPosition + 4
      /* SerializedTarget */
      , 1, // argCount
      strings, nodeContext, objectContext);
      var target = deserializedTarget[0];
      var {
        offset: argsOffset,
        args
      } = deserializeTransferrableObject(mutations, targetOffset, argCount, strings, nodeContext, objectContext);

      if (allowedExecution) {
        if (functionName === 'new') ; else {
          objectContext.store(objectId, target[functionName](...args));
        }
      }

      return argsOffset;
    },

    print(mutations, startPosition) {
      var functionName = strings.get(mutations[startPosition + 1
      /* FunctionName */
      ]);
      var objectId = mutations[startPosition + 2
      /* ObjectId */
      ];
      var argCount = mutations[startPosition + 3
      /* ArgumentCount */
      ];
      var {
        args: deserializedTarget
      } = deserializeTransferrableObject(mutations, startPosition + 4
      /* SerializedTarget */
      , 1, // argCount
      strings, nodeContext, objectContext);
      var target = deserializedTarget[0];
      return {
        type: 'OBJECT_CREATION',
        target,
        functionName,
        objectId,
        argCount,
        allowedExecution
      };
    }

  };
};

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ImageBitmapProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  var allowedExecution = config.executorsAllowed.includes(11
  /* IMAGE_BITMAP_INSTANCE */
  );
  return {
    execute(mutations, startPosition) {
      if (allowedExecution) {
        var targetIndex = mutations[startPosition + 1
        /* Target */
        ];
        var target = nodeContext.getNode(targetIndex);

        if (target) {
          self.createImageBitmap(target).then(imageBitmap => {
            workerContext.messageToWorker({
              [12
              /* type */
              ]: 10
              /* IMAGE_BITMAP_INSTANCE */
              ,
              [73
              /* callIndex */
              ]: mutations[startPosition + 2
              /* CallIndex */
              ],
              [38
              /* data */
              ]: imageBitmap
            }, [imageBitmap]);
          });
        } else {
          console.error("IMAGE_BITMAP_INSTANCE: getNode(" + targetIndex + ") is null.");
        }
      }

      return startPosition + 3
      /* End */
      ;
    },

    print(mutations, startPosition) {
      var targetIndex = mutations[startPosition + 1
      /* Target */
      ];
      var target = nodeContext.getNode(targetIndex);
      return {
        type: 'IMAGE_BITMAP_INSTANCE',
        target,
        allowedExecution,
        callIndex: mutations[startPosition + 2
        /* CallIndex */
        ]
      };
    }

  };
};

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var StorageProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  var allowedExecution = config.executorsAllowed.includes(12
  /* STORAGE */
  );

  var get = (location, key) => {
    if (config.sanitizer && location === 2
    /* AmpState */
    ) {
        config.sanitizer.getStorage(location, key).then(value => {
          var message = {
            [12
            /* type */
            ]: 11
            /* GET_STORAGE */
            ,
            [74
            /* storageKey */
            ]: key || '',
            [75
            /* storageLocation */
            ]: location,
            [21
            /* value */
            ]: value
          };
          workerContext.messageToWorker(message);
        });
      } else {
      console.error("STORAGE: Sanitizer not found or unsupported location:", location);
    }
  };

  var set = (location, key, value) => {
    if (config.sanitizer) {
      // TODO: Message worker so AMP.setState() can be Promise-able.
      config.sanitizer.setStorage(location, key, value);
    } else {
      var storage;

      if (location === 0
      /* Local */
      ) {
          storage = window.localStorage;
        } else if (location === 1
      /* Session */
      ) {
          storage = window.sessionStorage;
        }

      if (storage) {
        if (key == null) {
          if (value == null) {
            storage.clear();
          } else {
            throw new Error('Unexpected storage operation.');
          }
        } else {
          if (value == null) {
            storage.removeItem(key);
          } else {
            storage.setItem(key, value);
          }
        }
      } else {
        console.error("STORAGE: Unexpected location: \"" + location + "\".");
      }
    }
  };

  return {
    execute(mutations, startPosition) {
      if (allowedExecution) {
        var operation = mutations[startPosition + 1
        /* Operation */
        ];
        var location = mutations[startPosition + 2
        /* Location */
        ];
        var keyIndex = mutations[startPosition + 3
        /* Key */
        ];
        var valueIndex = mutations[startPosition + 4
        /* Value */
        ]; // TODO(choumx): Clean up key/value strings (or don't store them in the first place)
        // to avoid leaking memory.

        var key = keyIndex > 0 ? strings.get(keyIndex) : null;
        var value = valueIndex > 0 ? strings.get(valueIndex) : null;

        if (operation === 1
        /* GET */
        ) {
            get(location, key);
          } else if (operation === 2
        /* SET */
        ) {
            set(location, key, value);
          }
      }

      return startPosition + 5
      /* End */
      ;
    },

    print(mutations, startPosition) {
      var operation = mutations[startPosition + 1
      /* Operation */
      ];
      var location = mutations[startPosition + 2
      /* Location */
      ];
      var keyIndex = mutations[startPosition + 3
      /* Key */
      ];
      var valueIndex = mutations[startPosition + 4
      /* Value */
      ];
      var key = keyIndex > 0 ? strings.get(keyIndex) : null;
      var value = valueIndex > 0 ? strings.get(valueIndex) : null;
      return {
        type: 'STORAGE',
        operation,
        location,
        key,
        value,
        allowedExecution
      };
    }

  };
};

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class MutatorProcessor {
  /**
   * @param stringContext
   * @param nodeContext
   * @param workerContext
   * @param sanitizer Sanitizer to apply to content if needed.
   */
  constructor(stringContext, nodeContext, workerContext, config, objectContext) {
    this.mutationQueue = [];
    this.pendingMutations = false;
    /**
     * Apply all stored mutations syncronously. This method works well, but can cause jank if there are too many
     * mutations to apply in a single frame.
     *
     * Investigations in using asyncFlush to resolve are worth considering.
     */

    this.syncFlush = () => {
      if (WORKER_DOM_DEBUG) ;

      this.mutationQueue.forEach(mutationArray => {
        var operationStart = 0;
        var length = mutationArray.length;

        while (operationStart < length) {
          var mutationType = mutationArray[operationStart];
          var executor = this.executors[mutationType];

          if (WORKER_DOM_DEBUG) {
            console.log(ReadableMutationType[mutationType], executor.print(mutationArray, operationStart));
          }

          operationStart = executor.execute(mutationArray, operationStart);
        }
      });

      if (WORKER_DOM_DEBUG) ;

      this.mutationQueue = [];
      this.pendingMutations = false;
    };

    this.stringContext = stringContext;
    this.nodeContext = nodeContext;
    this.sanitizer = config.sanitizer;
    this.mutationPumpFunction = config.mutationPump;
    var args = [stringContext, nodeContext, workerContext, objectContext, config];
    var sharedLongTaskProcessor = LongTaskExecutor.apply(null, args);
    this.executors = {
      [2
      /* CHILD_LIST */
      ]: ChildListProcessor.apply(null, args),
      [0
      /* ATTRIBUTES */
      ]: AttributeProcessor.apply(null, args),
      [1
      /* CHARACTER_DATA */
      ]: CharacterDataProcessor.apply(null, args),
      [3
      /* PROPERTIES */
      ]: PropertyProcessor.apply(null, args),
      [4
      /* EVENT_SUBSCRIPTION */
      ]: EventSubscriptionProcessor.apply(null, args),
      [5
      /* GET_BOUNDING_CLIENT_RECT */
      ]: BoundingClientRectProcessor.apply(null, args),
      [6
      /* LONG_TASK_START */
      ]: sharedLongTaskProcessor,
      [7
      /* LONG_TASK_END */
      ]: sharedLongTaskProcessor,
      [8
      /* OFFSCREEN_CANVAS_INSTANCE */
      ]: OffscreenCanvasProcessor.apply(null, args),
      [9
      /* OBJECT_MUTATION */
      ]: ObjectMutationProcessor.apply(null, args),
      [10
      /* OBJECT_CREATION */
      ]: ObjectCreationProcessor.apply(null, args),
      [11
      /* IMAGE_BITMAP_INSTANCE */
      ]: ImageBitmapProcessor.apply(null, args),
      [12
      /* STORAGE */
      ]: StorageProcessor.apply(null, args)
    };
  }
  /**
   * Process MutationRecords from worker thread applying changes to the existing DOM.
   * @param phase Current Phase Worker Thread exists in.
   * @param nodes New nodes to add in the main thread with the incoming mutations.
   * @param stringValues Additional string values to use in decoding messages.
   * @param mutations Changes to apply in both graph shape and content of Elements.
   */


  mutate(phase, nodes, stringValues, mutations) {
    this.stringContext.storeValues(stringValues);
    this.nodeContext.createNodes(nodes, this.sanitizer);
    this.mutationQueue = this.mutationQueue.concat(mutations);

    if (!this.pendingMutations) {
      this.pendingMutations = true;
      this.mutationPumpFunction(this.syncFlush, phase);
    }
  }

}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class NodeContext {
  /**
   * Called when initializing a Worker, ensures the nodes in baseElement are
   * known for transmission into the Worker and future mutation events from the
   * Worker.
   * @param baseElement Element that will be controlled by a Worker
   */
  constructor(stringContext, baseElement) {
    this.createNodes = (buffer, sanitizer) => {
      var nodeBuffer = new Uint16Array(buffer);
      var nodeBufferLength = nodeBuffer.length;

      for (var iterator = 0; iterator < nodeBufferLength; iterator += 5
      /* End */
      ) {
        var node = void 0;

        if (nodeBuffer[iterator + 1
        /* NodeType */
        ] === 3
        /* TEXT_NODE */
        ) {
            node = document.createTextNode(this.stringContext.get(nodeBuffer[iterator + 3
            /* TextContent */
            ]));
          } else if (nodeBuffer[iterator + 1
        /* NodeType */
        ] === 8
        /* COMMENT_NODE */
        ) {
            node = document.createComment(this.stringContext.get(nodeBuffer[iterator + 3
            /* TextContent */
            ]));
          } else if (nodeBuffer[iterator + 1
        /* NodeType */
        ] === 11
        /* DOCUMENT_FRAGMENT_NODE */
        ) {
            node = document.createDocumentFragment();
          } else {
          var nodeName = this.stringContext.get(nodeBuffer[iterator + 2
          /* NodeName */
          ]);
          node = nodeBuffer[iterator + 4
          /* Namespace */
          ] !== 0 ? document.createElementNS(this.stringContext.get(nodeBuffer[iterator + 4
          /* Namespace */
          ]), nodeName) : document.createElement(nodeName); // TODO(KB): Restore Properties
          // skeleton.properties.forEach(property => {
          //   node[`${property.name}`] = property.value;
          // });
          // ((skeleton as TransferrableElement)[TransferrableKeys.childNodes] || []).forEach(childNode => {
          //   if (childNode[TransferrableKeys.transferred] === NumericBoolean.FALSE) {
          //     node.appendChild(this.createNode(childNode as TransferrableNode));
          //   }
          // });
          // If `node` is removed by the sanitizer, don't store it and return null.

          if (sanitizer && !sanitizer.sanitize(node)) {
            continue;
          }
        }

        this.storeNode(node, nodeBuffer[iterator]);
      }
    };
    /**
     * Returns the real DOM Element corresponding to a serialized Element object.
     * @param id
     * @return RenderableElement | null
     */


    this.getNode = id => {
      var node = this.nodes.get(id);

      if (node && node.nodeName === 'BODY') {
        // If the node requested is the "BODY"
        // Then we return the base node this specific <amp-script> comes from.
        // This encapsulates each <amp-script> node.
        return this.baseElement;
      }

      return node;
    };
    /**
     * Store the requested node and all of its children.
     * @param node node to store.
     */


    this.storeNodes = node => {
      this.storeNode(node, ++this.count);
      node.childNodes.forEach(n => this.storeNodes(n));
    };

    this.count = 2;
    this.stringContext = stringContext; // The nodes map is populated with two default values pointing to baseElement.
    // These are [document, document.body] from the worker.

    this.nodes = new Map([[1, baseElement], [2, baseElement]]);
    this.baseElement = baseElement; // To ensure a lookup works correctly from baseElement
    // add an index equal to the background thread document.body.

    baseElement._index_ = 2; // Lastly, it's important while initializing the document that we store
    // the default nodes present in the server rendered document.

    baseElement.childNodes.forEach(n => this.storeNodes(n));
  }
  /**
   * Establish link between DOM `node` and worker-generated identifier `id`.
   *
   * These _shouldn't_ collide between instances of <amp-script> since
   * each element creates it's own pool on both sides of the worker
   * communication bridge.
   * @param node
   * @param id
   */


  storeNode(node, id) {
    node._index_ = id;
    this.nodes.set(id, node);
  }

}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Stores indexed strings that are used in postMessage() calls from the worker.
 */
class StringContext {
  constructor() {
    this.strings = [];
  }
  /**
   * Return a string for the specified index.
   * @param index string index to retrieve.
   * @return string in map for the index.
   */


  get(index) {
    return this.strings[index] || '';
  }
  /**
   * Stores a string in mapping and returns the index of the location.
   * @param value string to store
   * @return location in map
   */


  store(value) {
    this.strings.push(value);
  }
  /**
   * Stores a set of strings.
   * @param values
   */


  storeValues(values) {
    values.forEach(v => this.store(v));
  }

}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function normalizeConfiguration(config) {
  return Object.assign({}, {
    mutationPump: requestAnimationFrame.bind(null),
    executorsAllowed: DefaultAllowedMutations
  }, config);
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var NODES_ALLOWED_TO_TRANSMIT_TEXT_CONTENT = [8
/* COMMENT_NODE */
, 3
/* TEXT_NODE */
];
/**
 * Serializes a DOM element for transport to the worker.
 * @param element
 * @param minimizeString Function for minimizing strings for optimized ferrying across postMessage.
 */

function createHydrateableNode(element, minimizeString, hydrateFilter, workerContext) {
  var filteredChildNodes = [].slice.call(element.childNodes).filter(hydrateFilter);
  var hydrated = {
    [7
    /* index */
    ]: element._index_,
    [11
    /* transferred */
    ]: 0
    /* FALSE */
    ,
    [0
    /* nodeType */
    ]: element.nodeType,
    [1
    /* localOrNodeName */
    ]: minimizeString(element.localName || element.nodeName),
    [4
    /* childNodes */
    ]: filteredChildNodes.map(child => createHydrateableNode(child, minimizeString, hydrateFilter, workerContext)),
    [2
    /* attributes */
    ]: [].map.call(element.attributes || [], attribute => [minimizeString(attribute.namespaceURI || 'null'), minimizeString(attribute.name), minimizeString(attribute.value)])
  };

  if (element.namespaceURI != null) {
    hydrated[6
    /* namespaceURI */
    ] = minimizeString(element.namespaceURI);
  }

  if (NODES_ALLOWED_TO_TRANSMIT_TEXT_CONTENT.includes(element.nodeType) && element.textContent !== null) {
    hydrated[5
    /* textContent */
    ] = minimizeString(element.textContent);
  }

  applyDefaultInputListener(workerContext, element);
  sendValueChangeOnAttributeMutation(workerContext, element);
  return hydrated;
}
/**
 * @param element
 */


function createHydrateableRootNode(element, config, workerContext) {
  var hydrateFilter = config.hydrateFilter || (() => true);

  var strings = [];
  var stringMap = new Map();

  var storeString = value => {
    if (stringMap.has(value)) {
      // Safe to cast since we verified the mapping contains the value.
      return stringMap.get(value);
    }

    var count = strings.length;
    stringMap.set(value, count);
    strings.push(value);
    return count;
  };

  var skeleton = createHydrateableNode(element, storeString, hydrateFilter, workerContext);
  return {
    skeleton,
    strings
  };
}
/**
 * @param element
 */

function createReadableHydrateableRootNode(element, config, workerContext) {
  // "Readable" variant doesn't do any string minimization so we can output it for debugging purposes.
  // Note that this intentionally breaks the type contract of createHydrateableNode() and HydrateableNode.
  return createHydrateableNode(element, value => value, config.hydrateFilter || (() => true), workerContext);
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @param element
 */

var readableHydrateableRootNode = (element, config, workerContext) => readableHydrateableNode(createReadableHydrateableRootNode(element, config, workerContext));
/**
 * @param nodeContext {NodeContext}
 * @param node {TransferredNode}
 */

var readableTransferredNode = (nodeContext, node) => node != null && nodeContext.getNode(node[0
/* Index */
]) || node;
/**
 * @param node
 */

function readableHydrateableNode(node) {
  var out = {
    nodeType: node[0
    /* nodeType */
    ],
    name: node[1
    /* localOrNodeName */
    ],
    attributes: null,
    childNodes: null
  };
  var attributes = node[2
  /* attributes */
  ];

  if (attributes) {
    out.attributes = attributes.map(attr => ({
      name: attr[1],
      value: attr[2]
    }));
  }

  var childNodes = node[4
  /* childNodes */
  ];

  if (childNodes) {
    out.childNodes = childNodes.map(readableHydrateableNode);
  }

  return out;
}
/**
 * @param message {MessageToWorker}
 */


var isEvent = message => message[12
/* type */
] == 1
/* EVENT */
;

var isValueSync = message => message[12
/* type */
] == 4
/* SYNC */
;

var isBoundingClientRect = message => message[12
/* type */
] === 6
/* GET_BOUNDING_CLIENT_RECT */
;
/**
 * @param nodeContext {NodeContext}
 * @param event {TransferrableEvent}
 */


function readableTransferrableEvent(nodeContext, event) {
  var value = item => {
    if (typeof item === 'number' || typeof item === 'boolean') {
      return item !== undefined ? item : null;
    }

    return item !== undefined && item !== null ? readableTransferredNode(nodeContext, item) : null;
  };

  return {
    type: event[12
    /* type */
    ],
    bubbles: value(event[25
    /* bubbles */
    ]),
    cancelable: value(event[26
    /* cancelable */
    ]),
    cancelBubble: value(event[27
    /* cancelBubble */
    ]),
    defaultPrevented: value(event[29
    /* defaultPrevented */
    ]),
    eventPhase: value(event[30
    /* eventPhase */
    ]),
    isTrusted: value(event[31
    /* isTrusted */
    ]),
    returnValue: value(event[32
    /* returnValue */
    ]),
    currentTarget: value(event[28
    /* currentTarget */
    ]),
    target: value(event[13
    /* target */
    ]),
    scoped: value(event[34
    /* scoped */
    ]),
    keyCode: value(event[35
    /* keyCode */
    ])
  };
}
/**
 * @param nodeContext {NodeContext}
 * @param value {TransferrableSyncValue}
 */


function readableTransferrableSyncValue(nodeContext, value) {
  var index = value[7
  /* index */
  ];
  return {
    target: nodeContext.getNode(index) || index,
    value: value[21
    /* value */
    ]
  };
}
/**
 * @param message
 */


function readableMessageToWorker(nodeContext, message) {
  if (isEvent(message)) {
    var event = message[39
    /* event */
    ];
    return {
      type: 'EVENT',
      event: readableTransferrableEvent(nodeContext, event)
    };
  } else if (isValueSync(message)) {
    var sync = message[40
    /* sync */
    ];
    return {
      type: 'SYNC',
      sync: readableTransferrableSyncValue(nodeContext, sync)
    };
  } else if (isBoundingClientRect(message)) {
    return {
      type: 'GET_BOUNDING_CLIENT_RECT',
      target: readableTransferredNode(nodeContext, message[13
      /* target */
      ])
    };
  } else {
    return 'Unrecognized MessageToWorker type: ' + message[12
    /* type */
    ];
  }
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class WorkerContext {
  /**
   * @param baseElement
   * @param nodeContext
   * @param workerDOMScript
   * @param authorScript
   * @param config
   */
  constructor(baseElement, nodeContext, workerDOMScript, authorScript, config) {
    this.nodeContext = nodeContext;
    this.config = config;
    var {
      skeleton,
      strings
    } = createHydrateableRootNode(baseElement, config, this);
    var cssKeys = [];
    var globalEventHandlerKeys = []; // TODO(choumx): Sync read of all localStorage and sessionStorage a possible performance bottleneck?

    var localStorageData = config.sanitizer ? config.sanitizer.getStorage(0
    /* Local */
    ) : window.localStorage;
    var sessionStorageData = config.sanitizer ? config.sanitizer.getStorage(1
    /* Session */
    ) : window.sessionStorage;

    for (var key in baseElement.style) {
      cssKeys.push(key);
    }

    for (var _key in baseElement) {
      if (_key.startsWith('on')) {
        globalEventHandlerKeys.push(_key);
      }
    }

    var code = "'use strict';(function(){" + workerDOMScript + "self['window']=self;var workerDOM=WorkerThread.workerDOM;WorkerThread.hydrate(workerDOM.document," + JSON.stringify(strings) + "," + JSON.stringify(skeleton) + "," + JSON.stringify(cssKeys) + "," + JSON.stringify(globalEventHandlerKeys) + ",[" + window.innerWidth + "," + window.innerHeight + "]," + JSON.stringify(localStorageData) + "," + JSON.stringify(sessionStorageData) + ");workerDOM.document[" + 59
    /* observe */
    + "](this);Object.keys(workerDOM).forEach(key => self[key]=workerDOM[key]);}).call(self);" + authorScript + "//# sourceURL=" + encodeURI(config.authorURL);
    this[55
    /* worker */
    ] = new Worker(URL.createObjectURL(new Blob([code])));

    if (WORKER_DOM_DEBUG) {
      console.info('debug', 'hydratedNode', readableHydrateableRootNode(baseElement, config, this));
    }

    if (config.onCreateWorker) {
      config.onCreateWorker(baseElement, strings, skeleton, cssKeys);
    }
  }
  /**
   * Returns the private worker.
   */


  get worker() {
    return this[55
    /* worker */
    ];
  }
  /**
   * @param message
   */


  messageToWorker(message, transferables) {
    if (WORKER_DOM_DEBUG) {
      console.info('debug', 'messageToWorker', readableMessageToWorker(this.nodeContext, message));
    }

    if (this.config.onSendMessage) {
      this.config.onSendMessage(message);
    }

    this.worker.postMessage(message, transferables || []);
  }

}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Stores objects that have their behavior handled from the main-thread. Each object is associated to a unique ID.
 */
class ObjectContext {
  constructor() {
    this.objects = new Map();
  }

  store(id, obj) {
    this.objects.set(id, obj);
  }

  get(id) {
    var obj = this.objects.get(id);

    if (obj) {
      return obj;
    } else {
      throw new Error('Object with id (' + id + ') does not exist.');
    }
  }

}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ALLOWABLE_MESSAGE_TYPES = [3
/* MUTATE */
, 2
/* HYDRATE */
];
/**
 * @param baseElement
 * @param authorScriptURL
 * @param workerDOMURL
 * @param callbacks
 * @param sanitizer
 * @param debug
 */

function fetchAndInstall(baseElement, config) {
  var fetchPromise = Promise.all([// TODO(KB): Fetch Polyfill for IE11.
  fetch(config.domURL).then(response => response.text()), fetch(config.authorURL).then(response => response.text())]);
  return install(fetchPromise, baseElement, config);
}
/**
 * @param fetchPromise
 * @param baseElement
 * @param config
 */

function install(fetchPromise, baseElement, config) {
  var stringContext = new StringContext();
  var objectContext = new ObjectContext();
  var nodeContext = new NodeContext(stringContext, baseElement);
  var normalizedConfig = normalizeConfiguration(config);
  return fetchPromise.then((_ref) => {
    var [domScriptContent, authorScriptContent] = _ref;

    if (domScriptContent && authorScriptContent && config.authorURL) {
      var workerContext = new WorkerContext(baseElement, nodeContext, domScriptContent, authorScriptContent, normalizedConfig);
      var mutatorContext = new MutatorProcessor(stringContext, nodeContext, workerContext, normalizedConfig, objectContext);

      workerContext.worker.onmessage = message => {
        var {
          data
        } = message;

        if (!ALLOWABLE_MESSAGE_TYPES.includes(data[12
        /* type */
        ])) {
          return;
        }

        mutatorContext.mutate(data[54
        /* phase */
        ], data[37
        /* nodes */
        ], data[41
        /* strings */
        ], new Uint16Array(data[36
        /* mutations */
        ]));

        if (config.onReceiveMessage) {
          config.onReceiveMessage(message);
        }
      };

      return workerContext.worker;
    }

    return null;
  });
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var toLower = value => value.toLowerCase();

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * AMP Element Children need to be filtered from Hydration, to avoid Author Code from manipulating it.
 * TODO: In the future, this contract needs to be more defined.
 * @param element
 */

var hydrateFilter = element => {
  if (element.parentNode !== null) {
    var lowerName = toLower(element.parentNode.localName || element.parentNode.nodeName);
    return !/amp-/.test(lowerName) || lowerName === 'amp-script';
  }

  return true;
};
/**
 * @param baseElement
 * @param domURL
 */


function upgradeElement(baseElement, domURL, longTask, sanitizer) {
  var authorURL = baseElement.getAttribute('src');

  if (authorURL) {
    return fetchAndInstall(baseElement, {
      domURL,
      authorURL,
      longTask,
      hydrateFilter,
      sanitizer
    });
  }

  return Promise.resolve(null);
}
/**
 * @param baseElement
 * @param fetchPromise Promise that resolves containing worker script, and author script.
 */

function upgrade(baseElement, fetchPromise, config) {
  config.hydrateFilter = hydrateFilter;
  return install(fetchPromise, baseElement, config);
}

export { upgrade, upgradeElement };
//# sourceMappingURL=main.mjs.map
