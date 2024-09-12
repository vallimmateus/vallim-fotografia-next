'use client'

import { FormControl } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { ChevronsUpDown, Check, PlusIcon } from 'lucide-react'
import { ControllerRenderProps } from 'react-hook-form'
import { Inputs } from './index'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { DialogTrigger } from '@/components/ui/dialog'

import { useState } from 'react'

type OrganizationSelectProps = {
  field: ControllerRenderProps<Inputs, 'organizations'>
  setValue: (name: string, value: Inputs['organizations']) => void
}

export function OrganizationSelect({
  field,
  setValue,
}: OrganizationSelectProps) {
  const [organizationName, setOrganizationName] = useState('')
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn('flex w-[200px] justify-between')}
          >
            <p
              className={cn('flex-1 text-start', {
                'text-muted-foreground': field.value.length === 0,
                truncate: field.value.length > 0,
              })}
            >
              {field.value.length > 0
                ? field.value.map((org) => org.name).join(', ')
                : 'Selecione uma ou mais'}
            </p>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder="Escolha a(s) organização(s)..."
            value={organizationName}
            onValueChange={setOrganizationName}
          />
          <CommandList>
            <CommandEmpty>Nenhuma organização encontrada.</CommandEmpty>
            {field.value.length > 0 && (
              <CommandGroup>
                {field.value.map((organization, idx) => {
                  return (
                    <CommandItem
                      className="cursor-pointer"
                      value={organization.name}
                      key={idx}
                      onSelect={() => {
                        setValue(
                          'organizations',
                          field.value.filter(
                            (org) => org.name !== organization.name,
                          ),
                        )
                      }}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {organization.name}
                      <Image
                        unoptimized
                        src={organization.logoUrl}
                        className="ml-2 h-4 w-4"
                        alt={organization.name}
                        width={16}
                        height={16}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
            {field.value.length > 0 &&
              field.value.length < organizations.length && <CommandSeparator />}
            {field.value.length < organizations.length && (
              <CommandGroup>
                {organizations
                  .filter(
                    (organization) =>
                      !field.value
                        .map((org) => org.name)
                        .includes(organization.name),
                  )
                  .map((organization, idx) => {
                    return (
                      <CommandItem
                        className="cursor-pointer"
                        value={organization.name}
                        key={idx}
                        onSelect={() => {
                          setValue(
                            'organizations',
                            [
                              ...field.value,
                              {
                                ...organization,
                                eventLogo: organization.logoUrl ?? null,
                              },
                            ].sort((a, b) => a.name.localeCompare(b.name)),
                          )
                        }}
                      >
                        <div className="mr-2 h-4 w-4" />
                        {organization.name}
                        <Image
                          unoptimized
                          src={organization.logoUrl}
                          className="ml-2 h-4 w-4"
                          alt={organization.name}
                          width={16}
                          height={16}
                        />
                      </CommandItem>
                    )
                  })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        {organizationName !== '' && (
          <>
            <Separator />
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full cursor-pointer justify-start rounded-none text-left"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {organizationName}
              </Button>
            </DialogTrigger>
          </>
        )}
        {/* {dialogOpen && (
          <NewOrganization
            setOrganizationName={setOrganizationName}
            organizationName={organizationName}
            setOrganizations={setOrganizations}
            setDialogOpen={setDialogOpen}
          />
        )} */}
      </PopoverContent>
    </Popover>
  )
}
