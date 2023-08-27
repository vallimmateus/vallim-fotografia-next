"use client"

import { useEffect, useState } from 'react'

type Todo = {
  todos: {
    id: string
    title: string
  }
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    async function handleTodos() {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos')
      const todos = await res.json()
      setTodos(todos)
      console.log(todos);
      
    }

    handleTodos()
  }, [])
  

  return (
    <main className="flex flex-col items-center">
      <h1>Home</h1>
      <div className="bg-black">
        <h2 className="text-white">Subtítulo</h2>
      </div>
      {todos?.length === 0 ? (
        <div>Loading...</div>
      ) : (
        todos?.map((todo) => {
          return (
            <div key={todo.id}>
              <p>
                {todo.id}: {todo.title}
              </p>
            </div>
          )
        })
      )}
    </main>
  )
}
