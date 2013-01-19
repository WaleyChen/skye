class Task
  include Mongoid::Document

  field :name
  field :description
  field :start_after
  field :end_before
  field :duration
  field :splittable
  field :calendar
  field :email

  belongs_to :user
end