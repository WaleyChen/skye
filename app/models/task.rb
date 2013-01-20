class Task
  include Mongoid::Document

  field :name
  field :description
  field :startAfter
  field :endBefore
  field :duration
  field :splittable
  field :calendar
  field :email
  field :event_id
  field :head_id

  belongs_to :user
end