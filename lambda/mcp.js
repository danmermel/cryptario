
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';

const handler = createMcpHandler(() => {

  const server = new McpServer({ name: 'anagramsolver', version: '1.0.0' });

  server.registerTool(
    'solve-anagram',
    {
      description: 'Solve an anagram puzzle',
      inputSchema: z.object({ word: z.string() })
    },
    async ({ word }) => {
      const response = await fetch(`https://qko2f2pk3we5yi5gqoe5wquvx40cvvom.lambda-url.eu-west-1.on.aws/?clue=${encodeURIComponent(word)}`);
      const result = await response.json();
      return {
        content: [{ type: 'text', text: result.join(', ') }],
        structuredContent: result
      };
    });

  return server;
});

export default handler;