# MikroORM populate reproduction

This is a reproduction for a bug in [MikroORM](https://github.com/mikro-orm/mikro-orm), where the init-hook for populated entities gets called multiple times.

## Testing the reproduction
```
npm install
npm test
```

You should see one failing test and one passing test
