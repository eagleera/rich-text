import flatMap from 'lodash.flatmap';

export function toContentfulDocument(slateDocument: Slate.Document): Contentful.Document {
  return {
    category: 'document',
    content: flatMap(slateDocument.nodes, node => convertNode(node)) as Contentful.Block[],
  };
}

function convertNode(node: Slate.Block | Slate.Inline | Slate.Text): Contentful.Node[] {
  const nodes: Contentful.Node[] = [];
  switch (node.object) {
    case 'block':
    case 'inline':
      const slateBlock = node as Slate.Block;
      const content = flatMap(slateBlock.nodes, childNode => convertNode(childNode));
      const contentfulBlock = {
        category: slateBlock.object,
        type: slateBlock.type,
        content,
      } as Contentful.Block;
      nodes.push(contentfulBlock);
      break;
    case 'text':
      convertText(node as Slate.Text).forEach(childNode => nodes.push(childNode));
      break;
    default:
      assertUnreachable(node);
      break;
  }

  return nodes;
}

function convertText(node: Slate.Text): Contentful.Text[] {
  return node.leaves.map<Contentful.Text>(leave => ({
    category: 'text',
    type: 'text',
    value: leave.text,
    marks: leave.marks,
  }));
}

function assertUnreachable(object: never): never {
  throw new Error(`Unexpected slate object ${object}`);
}
