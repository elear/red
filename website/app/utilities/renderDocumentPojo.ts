import { h, createTextVNode } from 'vue'
import type { VNode } from 'vue'
import AMaybeRFCLink from '~/components/AMaybeRFCLink.vue'
import HorizontalScrollable from '~/components/HorizontalScrollable.vue'
import PdfPages from '~/components/PdfPages.vue'
import AbsoluteHorizontalScrollable from '~/components/AbsoluteHorizontalScrollable.vue'
import Fragment from '~/components/Fragment.vue'
import { nodePojoWalker } from '~/utilities/dom'
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

const renderNodePojo = (node: NodePojo): VNode => {
  if (node.type === 'Element') {
    const children = node.children.map(renderNodePojo)
    const childrenForVue = unwrapChildrenForVue(children)
    const ATTR_COMPONENT = 'data-component'
    const componentAttr = node.attributes[ATTR_COMPONENT]
    if (node.nodeName === 'a') {
      return h(
        AMaybeRFCLink,
        { href: '', ...node.attributes },
        () => childrenForVue
      )
    } else if (node.nodeName === 'svg') {
      return h(
        node.nodeName,
        {
          ...node.attributes,
          class: `dark:contrast-125 dark:brightness-85 dark:invert ${node.attributes.class ?? ''}`
        },
        childrenForVue
      )
    } else if (componentAttr === 'HorizontalScrollable') {
      const ATTR_ABSOLUTE = 'data-component-absolute'
      if (ATTR_ABSOLUTE in node.attributes) {
        const isAbsolute = node.attributes[ATTR_ABSOLUTE] === true.toString()
        if (isAbsolute) {
          const ATTR_ABSOLUTE_CHILDWIDTH = 'data-component-childwidth'
          const childWidthAttr = node.attributes[ATTR_ABSOLUTE_CHILDWIDTH]
          const ATTR_ABSOLUTE_CHILDHEIGHT = 'data-component-childheight'
          const childHeightAttr = node.attributes[ATTR_ABSOLUTE_CHILDHEIGHT]
          if (childWidthAttr && childHeightAttr) {
            const deleteDataAttributes = (
              attributes: ElementPojo['attributes']
            ): ElementPojo['attributes'] => {
              const entries = Object.entries(attributes)
              const filteredEntries = entries.filter(
                ([key]) => !key.startsWith('data-')
              )
              const filteredAttributes = Object.fromEntries(filteredEntries)
              return filteredAttributes
            }
            return h(
              AbsoluteHorizontalScrollable,
              {
                ...deleteDataAttributes(node.attributes),
                childWidthAttr,
                childHeightAttr,
                innerClass:
                  'py-3 rfc-content-padding-left rfc-content-padding-right'
              },
              () => childrenForVue
            )
          } else {
            console.warn(
              `Unable to render AbsoluteHorizontalScrollable ${ATTR_ABSOLUTE} because attributes ${ATTR_ABSOLUTE_CHILDWIDTH}=${JSON.stringify(childWidthAttr)} ${ATTR_ABSOLUTE_CHILDHEIGHT}${JSON.stringify(childHeightAttr)}`
            )
          }
        }
      }
      return h(HorizontalScrollable, node.attributes, () => childrenForVue)
    } else if (componentAttr === 'Placeholder') {
      // FIXME: delete this case once the component is removed from the bucket
      return h('div', node.attributes, childrenForVue)
    } else if (componentAttr === 'PdfPages') {
      const pdfPagesChildrenForVue = nodePojoWalker(node.children, (node) => {
        if (
          node.type === 'Element' &&
          node.nodeName.toLowerCase() === 'img'
        ) {
          node.attributes['class'] =
            'w-full min-w-[425px] max-w-[1000px] dark:contrast-125 dark:brightness-85 dark:invert'
        }
        return node
      }).map(renderNodePojo)

      return h(PdfPages, node.attributes, () => pdfPagesChildrenForVue)
    }
    return h(node.nodeName, node.attributes, childrenForVue)
  } else if (node.type === 'Text') {
    return createTextVNode(node.textContent)
  }
  throw Error(`Unhandled NodePojo ${JSON.stringify(node)}`)
}

export const renderDocumentPojo = (nodes: DocumentPojo): VNode => {
  const children = nodes.map(renderNodePojo)
  return h(Fragment, () => children)
}
