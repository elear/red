import { h, createTextVNode } from 'vue'
import type { VNode } from 'vue'
import Fragment from '~/components/Fragment.vue'

import type { DocumentPojo, ElementPojo, NodePojo } from '~/utilities/rfc-validators'

const unwrapChildrenForVue = (vnodes: VNode[]) => {
  switch (vnodes.length) {
    case 0:
      return undefined
    case 1:
      return vnodes[0]
    default:
      return vnodes
  }
}

type ChildrenForVue = VNode | VNode[] | undefined
type ElementRenderer = (node: ElementPojo, childrenForVue: ChildrenForVue) => VNode
export type ElementRenderers = Record<string, ElementRenderer> & { __default: ElementRenderer }

export const renderNodePojo = (node: NodePojo, elementRenderers: ElementRenderers): VNode => {
  if (node.type === 'Element') {
    const children = node.children.map(node => renderNodePojo(node, elementRenderers))
    const childrenForVue = unwrapChildrenForVue(children)
    const key = node.attributes['data-component'] ?? node.nodeName
    const renderer = elementRenderers[key] ?? elementRenderers.__default
    return renderer(node, childrenForVue)
  } else if (node.type === 'Text') {
    return createTextVNode(node.textContent)
  }
  throw Error(`Unhandled NodePojo ${JSON.stringify(node)}`)
}

export const renderDocumentPojo = (nodes: DocumentPojo, elementRenderers: ElementRenderers): VNode => {
  const children = nodes.map((node) => renderNodePojo(node, elementRenderers))
  return h(Fragment, () => children)
}
